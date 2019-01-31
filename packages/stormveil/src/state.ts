import { Team } from "./team";
import { Tile } from "./tile";
import { Vector } from "./types/vector";

const enum Mask {
    Capturable = Tile.Attk | Tile.Defn | Tile.King | Tile.Cast,
    KingAnvils = Tile.Attk | Tile.Refu | Tile.None,
    KingLike   = Tile.King | Tile.Cast | Tile.Sanc,
}

export interface IBoard {
    tiles: Tile[];
    width: number;
}

interface ISimpleState {
    board: IBoard;
    turn: Team;
}

export interface IState extends ISimpleState {
    history: Array<[Vector, Vector]>;
    initial: ISimpleState;
}

const offsets: number[] = [0, -1, 1, 0, 0, 1, -1, 0];

function clone(s: IBoard): IBoard {
    return { tiles: s.tiles.slice(), width: s.width };
}

export function vec(w: number, i: number): Vector {
    return [i % w, Math.floor(i / w)];
}

function key(w: number, x: number, y: number): number {
    return w * y + x;
}

function get(s: IBoard, x: number, y: number): Tile {
    const t = s.tiles[key(s.width, x, y)];
    if (t === undefined) {
        return Tile.None;
    }

    return t;
}

function set(s: IBoard, x: number, y: number, t: Tile): void {
    s.tiles[key(s.width, x, y)] = t;
}

function capture(s: IBoard, x: number, y: number): void {
    set(s, x, y, away(get(s, x, y)));
}

export function capturable(t: Tile): boolean {
    return Boolean(t & Mask.Capturable);
}

export function team(t: Tile): Team {
    switch (t) {
        case Tile.Defn:
        case Tile.King:
        case Tile.Cast:
        case Tile.Sanc:
            return Team.Defenders;
        case Tile.Attk:
            return Team.Attackers;
        default:
            return Team.None;
    }
}

export function opponent(t: Team): Team {
    switch (t) {
        case Team.Attackers:
            return Team.Defenders;
        case Team.Defenders:
            return Team.Attackers;
        case Team.None:
            throw new Error();
    }
}

function hostile(a: Tile, b: Tile): boolean {
    if (a === Tile.Thrn || b === Tile.Thrn) {
        return true;
    }

    if (a === Tile.Refu || b === Tile.Refu) {
        return true;
    }

    if (team(a) === Team.None || team(b) === Team.None) {
        return false;
    }

    return team(a) !== team(b);
}

function inside(a: Tile): Tile {
    switch (a) {
        case Tile.Cast:
        case Tile.Sanc:
            return Tile.King;
        default:
            return a;
    }
}

function away(a: Tile): Tile {
    switch (a) {
        case Tile.Cast:
            return Tile.Thrn;
        case Tile.Sanc:
            return Tile.Refu;
        default:
            return Tile.Empt;
    }
}

function into(a: Tile, b: Tile): Tile {
    switch (b) {
        case Tile.Thrn:
            return Tile.Cast;
        case Tile.Refu:
            return Tile.Sanc;
        default:
            return a;
    }
}

export function resolve(s: IBoard, [ax, ay]: Vector, [bx, by]: Vector): IBoard {
    const state = clone(s);
    const tile = get(state, ax, ay);
    set(state, ax, ay, away(tile));
    set(state, bx, by, into(inside(tile), get(state, bx, by)));

    for (let i = 0; i < 8; i += 2) {
        const ox = offsets[i];
        const oy = offsets[i + 1];
        const cx = bx + ox;
        const cy = by + oy;
        const adjc = get(state, cx, cy);

        // Continue early when the adjacent tile is not a capturable tile.
        if (adjc & ~Mask.Capturable) {
            continue;
        }

        // Continue early when the adjacent tile is not hostile to the playing
        // tile.
        if (!hostile(tile, adjc)) {
            continue;
        }

        // The adjacent tile is an enemy: determine if it is being captured
        // by checking the next tile across. When the "anvil" is either None
        // or on the same side as the moving tile, the center tile is
        // considered captured.
        const vx = bx + (ox * 2);
        const vy = by + (oy * 2);
        if (hostile(adjc, get(state, vx, vy)) && (adjc & ~Mask.KingLike)) {
            capture(state, cx, cy);
        }

        // Attackers may capture the king only when they have the king
        // surrounded on all four sides.
        if ((tile & Tile.Attk) && (adjc & Tile.King)
            && (get(state, cx, cy + 1) & Mask.KingAnvils)
            && (get(state, cx, cy - 1) & Mask.KingAnvils)
            && (get(state, cx + 1, cy) & Mask.KingAnvils)
            && (get(state, cx - 1, cy) & Mask.KingAnvils)) {
            capture(state, cx, cy);
        }
    }

    return state;
}

function allowed(t: Tile, u: Tile): boolean {
    if (u & Tile.Empt) {
        return true;
    }

    if ((t & Mask.KingLike) &&
        (u & (Tile.Thrn | Tile.Refu))) {
        return true;
    }

    return false;
}

export function victor(s: IBoard): Team | null {
    let kf = false;
    let af = false;
    for (let i = 0; i < s.tiles.length; i += 1) {
        const t = s.tiles[i];
        if (t === Tile.Sanc) {
            return Team.Defenders;
        }

        if (t & (Tile.King | Tile.Cast)) {
            kf = true;
        }

        if (t === Tile.Attk) {
            af = true;
        }
    }

    if (!kf) {
        return Team.Attackers;
    }

    if (!af) {
        return Team.Defenders;
    }

    return null;
}

export function moveable(s: IBoard, t: Team): Vector[] {
    const result = [];
    for (let i = 0; i < s.tiles.length; i += 1) {
        if (team(s.tiles[i]) !== t) {
            continue;
        }

        const v = vec(s.width, i);
        const vs = moves(s, v);
        if (vs.length === 0) {
            continue;
        }

        result.push(v);
    }

    return result;
}

export function moves(s: IBoard, [ax, ay]: Vector): Vector[] {
    const m = [];
    const t = get(s, ax, ay);

    for (let i = 0; i < 8; i += 2) {
        const ox = offsets[i];
        const oy = offsets[i + 1];
        for (let k = 1; k < Infinity; k += 1) {
            const bx = ax + (ox * k);
            const by = ay + (oy * k);
            if (bx < 0 || bx >= s.width) {
                break;
            }

            const n = get(s, bx, by);
            if (t & Tile.Defn && n & Tile.Thrn) {
                continue;
            }

            if (allowed(t, n)) {
                m.push([bx, by] as Vector);
                continue;
            }

            break;
        }
    }

    return m;
}

export function play(s: IState, a: Vector, b: Vector): IState {
    return {
        board: resolve(s.board, a, b),
        history: s.history.concat([a, b]),
        turn: opponent(s.turn),
        initial: s.initial,
    };
}

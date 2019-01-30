import { Team } from "./team";
import { Tile } from "./tile";
import { Vector } from "./types/vector";

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

const offsets: Vector[] = [[0, -1], [1, 0], [0, 1], [-1, 0]];

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
    switch (t) {
        case Tile.Throne:
        case Tile.Refuge:
        case Tile.Empty:
        case Tile.None:
            return false;
        default:
            return true;
    }
}

export function team(t: Tile): Team {
    switch (t) {
        case Tile.Defender:
        case Tile.King:
        case Tile.Castle:
        case Tile.Sanctuary:
            return Team.Defenders;
        case Tile.Attacker:
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
    if (a === Tile.Throne || b === Tile.Throne) {
        return true;
    }

    if (a === Tile.Refuge || b === Tile.Refuge) {
        return true;
    }

    if (team(a) === Team.None || team(b) === Team.None) {
        return false;
    }

    return team(a) !== team(b);
}

function inside(a: Tile): Tile {
    switch (a) {
        case Tile.Castle:
        case Tile.Sanctuary:
            return Tile.King;
        default:
            return a;
    }
}

function away(a: Tile): Tile {
    switch (a) {
        case Tile.Castle:
            return Tile.Throne;
        case Tile.Sanctuary:
            return Tile.Refuge;
        default:
            return Tile.Empty;
    }
}

function into(a: Tile, b: Tile): Tile {
    switch (b) {
        case Tile.Throne:
            return Tile.Castle;
        case Tile.Refuge:
            return Tile.Sanctuary;
        default:
            return a;
    }
}

export function resolve(s: IBoard, [ax, ay]: Vector, [bx, by]: Vector): IBoard {
    const t = get(s, ax, ay);
    const state = clone(s);
    set(state, ax, ay, away(t));
    set(state, bx, by, into(inside(t), get(state, bx, by)));

    for (let i = 0; i < 4; i += 1) {
        const ox = offsets[i][0];
        const oy = offsets[i][1];
        const cx = bx + ox;
        const cy = by + oy;

        // The neighboring tile is not an enemy, this offset can not result
        // in a capture.
        const n = get(state, cx, cy);
        if (!capturable(n) || !hostile(t, n)) {
            continue;
        }

        // The neighboring tile is an enemy: determine if it is being captured
        // by checking the next tile across. When the "anvil" is either None
        // or on the same side as the moving tile, the center tile is
        // considered captured.
        const anvil = get(state, bx + (ox * 2), by + (oy * 2));
        if (hostile(n, anvil) && n !== Tile.King) {
            capture(state, cx, cy);
        }

        // Attackers may capture the king only when they have the king
        // surrounded on all four sides.
        if (eq(t, Tile.Attacker) &&
            eq(n, Tile.King) &&
            eq(get(state, cx, cy + 1), Tile.Attacker, Tile.None) &&
            eq(get(state, cx, cy - 1), Tile.Attacker, Tile.None) &&
            eq(get(state, cx + 1, cy), Tile.Attacker, Tile.None) &&
            eq(get(state, cx - 1, cy), Tile.Attacker, Tile.None)) {
            capture(state, cx, cy);
        }
    }

    return state;
}

function eq(...ts: Tile[]): boolean {
    const l = ts.length;
    if (l < 2) {
        return true;
    }

    for (let i = 1; i < l; i += 1) {
        if (ts[0] === ts[i]) {
            return true;
        }
    }

    return false;
}

function allowed(t: Tile, u: Tile): boolean {
    if (u === Tile.Empty) {
        return true;
    }

    if ((t === Tile.King || t === Tile.Castle || t === Tile.Sanctuary) &&
        (u === Tile.Throne || u === Tile.Refuge)) {
        return true;
    }

    return false;
}

export function victor(s: IBoard): Team | null {
    let kf = false;
    let af = false;
    for (let i = 0; i < s.tiles.length; i += 1) {
        const t = s.tiles[i];
        if (eq(t, Tile.Sanctuary)) {
            return Team.Defenders;
        }

        if (eq(t, Tile.King, Tile.Castle)) {
            kf = true;
        }

        if (eq(t, Tile.Attacker)) {
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

    for (let i = 0; i < 4; i += 1) {
        const [ ox, oy ] = offsets[i];
        for (let k = 1; k < Infinity; k += 1) {
            const bx = ax + (ox * k);
            const by = ay + (oy * k);
            if (bx < 0 || bx >= s.width) {
                break;
            }

            const n = get(s, bx, by);
            if (t === Tile.Defender && n === Tile.Throne) {
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
    const nextState = { ...s };
    nextState.board = resolve(nextState.board, a, b);
    nextState.turn = opponent(nextState.turn);
    nextState.history = nextState.history.concat([a, b]);
    return nextState;
}

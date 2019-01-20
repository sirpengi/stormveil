import partition from "./partition";
import Side from "./side";
import Tile from "./tile";
import { Vector } from "./types/vector";

export interface IBoard {
    tiles: Tile[];
    width: number;
}

const offsets: Vector[] = [[0, -1], [1, 0], [0, 1], [-1, 0]];

function flat<T>([first, ...rest]: T[][]): T[] {
    return rest.reduce((result, coll) => result.concat(coll), first);
}

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

export function side(t: Tile): Side {
    switch (t) {
        case Tile.Defender:
        case Tile.King:
        case Tile.Castle:
        case Tile.Sanctuary:
            return Side.Defenders;
        case Tile.Attacker:
            return Side.Attackers;
        default:
            return Side.None;
    }
}

function hostile(a: Tile, b: Tile): boolean {
    if (a === Tile.Throne || b === Tile.Throne) {
        return true;
    }

    if (a === Tile.Refuge || b === Tile.Refuge) {
        return true;
    }

    if (side(a) === Side.None || side(b) === Side.None) {
        return false;
    }

    return side(a) !== side(b);
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
    const tile = get(s, ax, ay);
    const state = clone(s);
    set(state, ax, ay, away(tile));
    set(state, bx, by, into(inside(tile), get(state, bx, by)));

    for (let i = 0; i < 4; i += 1) {
        const ox = offsets[i][0];
        const oy = offsets[i][1];
        const cx = bx + ox;
        const cy = by + oy;

        // The neighboring tile is not an enemy, this offset can not result
        // in a capture.
        const neighbor = get(state, cx, cy);
        if (!capturable(neighbor) || !hostile(tile, neighbor)) {
            continue;
        }

        // The neighboring tile is an enemy: determine if it is being captured
        // by checking the next tile across. When the "anvil" is either None
        // or on the same side as the moving tile, the center tile is
        // considered captured.
        const anvil = get(state, bx + (ox * 2), by + (oy * 2));
        if (hostile(neighbor, anvil) && neighbor !== Tile.King) {
            capture(state, cx, cy);
        }

        // Attackers may capture the king only when they have the king
        // surrounded on all four sides.
        if (tile === Tile.Attacker &&
            neighbor === Tile.King &&
            get(state, cx, cy + 1) === Tile.Attacker &&
            get(state, cx, cy - 1) === Tile.Attacker &&
            get(state, cx + 1, cy) === Tile.Attacker &&
            get(state, cx - 1, cy) === Tile.Attacker) {
            capture(state, cx, cy);
        }
    }

    return state;
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

export function moveable(s: IBoard, t: Side): Vector[] {
    const result = [];
    for (let i = 0; i < s.tiles.length; i += 1) {
        if (side(s.tiles[i]) !== t) {
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

export function encode(t: Tile): string {
    switch (t) {
        case Tile.Attacker:    return "A";
        case Tile.Castle:      return "C";
        case Tile.Defender:    return "D";
        case Tile.Empty:       return "_";
        case Tile.King:        return "K";
        case Tile.None:        return "N";
        case Tile.Refuge:      return "R";
        case Tile.Sanctuary:   return "S";
        case Tile.Throne:      return "T";
        default:               return " ";
    }
}

function decode(s: string): Tile {
    switch (s) {
        case "A": return Tile.Attacker;
        case "C": return Tile.Castle;
        case "D": return Tile.Defender;
        case "_": return Tile.Empty;
        case "K": return Tile.King;
        case "N": return Tile.None;
        case "R": return Tile.Refuge;
        case "S": return Tile.Sanctuary;
        case "T": return Tile.Throne;
        default:  return Tile.None;
    }
}

export function marshal(s: IBoard): string {
    const tiles = s.tiles.map(n => encode(n));
    return partition(tiles, s.width)
        .map(r => r.join(" "))
        .join("\n");
}

export function unmarshal(s: string): IBoard {
    const tiles = s
        .trim()
        .replace(/ /g, "")
        .split(/\n/g)
        .map(v => v.split(""))
        .map(v => v.map(decode));

    const [ sample ] = tiles;
    return { tiles: flat(tiles), width: sample.length };
}

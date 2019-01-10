import { Side } from "./side";
import { Tile } from "./tile";

export interface IBoard {
    [key: string]: Tile;
}

const offsets: Vector[] = [[0, -1], [1, 0], [0, 1], [-1, 0]];

function vec(s: string): Vector {
    const [x, y] = s.split(",").map(Number);
    return [x, y];
}

function key(v: Vector): string {
    return v.toString();
}

function get(s: IBoard, v: Vector): Tile {
    return s[key(v)] || Tile.None;
}

function gets(s: IBoard, v: Vector[]): Tile[] {
    return v.map((t) => get(s, t));
}

function add(...v: Vector[]): Vector {
    return v.reduce(([ax, ay], [bx, by]) => [ax + bx, ay + by], [0, 0]);
}

function mul([x, y]: Vector, i: number): Vector {
    return [x * i, y * i];
}

function merge(...s: IBoard[]): IBoard {
    return s.reduce((a, b) => ({ ...a, ...b }), {});
}

function remove<K extends string>({ [k]: _, ...dict }: IBoard, k: K): Omit<IBoard, K> {
    return dict;
}

function capture(s: IBoard, v: Vector): IBoard {
    return merge(s, remove(s, (key(v))), { [key(v)]: away(get(s, v)) });
}

function side(t: Tile): Side {
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

function isEnemy(a: Tile, b: Tile): boolean {
    const sa = side(a);
    const sb = side(b);
    if (sa === Side.None || sb === Side.None) {
        return false;
    }

    return sa !== sb;
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

export function resolve(state: IBoard, a: Vector, b: Vector): IBoard {
    const tile = get(state, a);

    const nextState = offsets.reduce((prevState, offset) => {
        const v = add(b, offset);

        // The neighboring tile is not an enemy, this offset can not result
        // in a capture.
        const neighbor = get(prevState, v);
        if (!isEnemy(tile, neighbor)) {
            return prevState;
        }

        // Attackers may capture the king only when they have the king
        // surrounded on all four sides.
        if (tile === Tile.Attacker && neighbor === Tile.King) {
            const anvils = gets(prevState, offsets.map((o) => add(v, o)))
                .filter((p) => p === Tile.Attacker);

            // Three attackers already surround the king: this play will result
            // in it being surrounded on all four sides and captured.
            if (anvils.length === 3) {
                return capture(prevState, v);
            }

            // The king is not totally surrounded, return early to avoid the
            // common capture logic below.
            return prevState;
        }

        // The neighboring tile is an enemy: determine if it is being captured
        // by checking the next tile across. When the "anvil" is either None
        // or on the same side as the moving tile, the center tile is
        // considered captured.
        const anvil = get(prevState, add(b, mul(offset, 2)));
        if (side(anvil) === side(tile) || anvil === Tile.None) {
            return capture(prevState, v);
        }

        return prevState;
    }, state);

    return merge(nextState, {
        [key(a)]: away(tile),
        [key(b)]: into(inside(tile), get(nextState, b)),
    });
}

export function victor(s: IBoard): Side | null {
    const ts = Object.values(s);
    if (ts.includes(Tile.Sanctuary)) {
        return Side.Defenders;
    }

    if (!(ts.includes(Tile.King))) {
        return Side.Attackers;
    }

    return null;
}

function decode(t: Tile): string {
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
        default:                return " ";
    }
}

function encode(s: string): Tile {
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
    const result: Tile[][] = [];
    Object.keys(s).forEach((k) => {
        const [x, y] = vec(k);
        if (!Array.isArray(result[y])) {
            result[y] = [];
        }

        result[y][x] = s[k];
    });

    return result.map((r) => r.map(decode).join(" ")).join("\n");
}

export function unmarshal(strings: TemplateStringsArray): IBoard {
    return strings[0]
        .trim()
        .replace(/ /g, "")
        .split(/\n/g)
        .map((v) => v.split(""))
        .reduce((result, symbols, y) =>
            ({ ...result, ...symbols.reduce((dict, sym, x) =>
                ({ ...dict, [key([x, y])]: encode(sym) }), {}) }), {});
}

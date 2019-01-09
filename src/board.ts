import { Piece } from "./piece";
import { Side } from "./side";

export interface IBoard {
    [key: string]: Piece;
}

const offsets: Vector[] = [[0, -1], [1, 0], [0, 1], [-1, 0]];

function vec(s: string): Vector {
    const [x, y] = s.split(",").map(Number);
    return [x, y];
}

function key(v: Vector): string {
    return v.toString();
}

function get(s: IBoard, v: Vector): Piece {
    return s[key(v)] || Piece.None;
}

function gets(s: IBoard, v: Vector[]): Piece[] {
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

function side(t: Piece): Side {
    switch (t) {
        case Piece.Defender:
        case Piece.King:
        case Piece.Castle:
        case Piece.Sanctuary:
            return Side.Defenders;
        case Piece.Attacker:
            return Side.Attackers;
        default:
            return Side.None;
    }
}

function isEnemy(a: Piece, b: Piece): boolean {
    const sa = side(a);
    const sb = side(b);
    if (sa === Side.None || sb === Side.None) {
        return false;
    }

    return sa !== sb;
}

function beneath(a: Piece): Piece {
    switch (a) {
        case Piece.Castle:
        case Piece.Sanctuary:
            return Piece.King;
        default:
            return a;
    }
}

function away(a: Piece): Piece {
    switch (a) {
        case Piece.Castle:
            return Piece.Throne;
        case Piece.Sanctuary:
            return Piece.Refuge;
        default:
            return Piece.Empty;
    }
}

function into(a: Piece, b: Piece): Piece {
    switch (b) {
        case Piece.Throne:
            return Piece.Castle;
        case Piece.Refuge:
            return Piece.Sanctuary;
        default:
            return a;
    }
}

export function resolve(state: IBoard, a: Vector, b: Vector): IBoard {
    const piece = get(state, a);

    const nextState = offsets.reduce((prevState, offset) => {
        const v = add(b, offset);

        // The neighboring piece is not an enemy, this offset can not result
        // in a capture.
        const neighbor = get(prevState, v);
        if (!isEnemy(piece, neighbor)) {
            return prevState;
        }

        // Attackers may capture the king only when they have the king
        // surrounded on all four sides.
        if (piece === Piece.Attacker && neighbor === Piece.King) {
            const anvils = gets(prevState, offsets.map((o) => add(v, o)))
                .filter((p) => p === Piece.Attacker);

            // Three attackers already surround the king: this play will result
            // in it being surrounded on all four sides and captured.
            if (anvils.length === 3) {
                return capture(prevState, v);
            }

            // The king is not totally surrounded, return early to avoid the
            // common capture logic below.
            return prevState;
        }

        // The neighboring piece is an enemy: determine if it is being captured
        // by checking the next tile across. When the "anvil" is either None
        // or on the same side as the moving piece, the center piece is
        // considered captured.
        const anvil = get(prevState, add(b, mul(offset, 2)));
        if (side(anvil) === side(piece) || anvil === Piece.None) {
            return capture(prevState, v);
        }

        return prevState;
    }, state);

    return merge(nextState, {
        [key(a)]: away(piece),
        [key(b)]: into(beneath(piece), get(nextState, b)),
    });
}

export function victor(s: IBoard): Side | null {
    const ts = Object.values(s);
    if (ts.includes(Piece.Sanctuary)) {
        return Side.Defenders;
    }

    if (!(ts.includes(Piece.King))) {
        return Side.Attackers;
    }

    return null;
}

function decode(t: Piece): string {
    switch (t) {
        case Piece.Attacker:    return "A";
        case Piece.Castle:      return "C";
        case Piece.Defender:    return "D";
        case Piece.Empty:       return "_";
        case Piece.King:        return "K";
        case Piece.None:        return "N";
        case Piece.Refuge:      return "R";
        case Piece.Sanctuary:   return "S";
        case Piece.Throne:      return "T";
        default:                return " ";
    }
}

function encode(s: string): Piece {
    switch (s) {
        case "A": return Piece.Attacker;
        case "C": return Piece.Castle;
        case "D": return Piece.Defender;
        case "_": return Piece.Empty;
        case "K": return Piece.King;
        case "N": return Piece.None;
        case "R": return Piece.Refuge;
        case "S": return Piece.Sanctuary;
        case "T": return Piece.Throne;
        default:  return Piece.None;
    }
}

export function marshal(s: IBoard): string {
    const result: Piece[][] = [];
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

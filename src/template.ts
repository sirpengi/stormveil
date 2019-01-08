import { IBoard, key, vec } from "./board";
import { Piece } from "./piece";

function piece(s: string): Piece {
    switch (s) {
        case "_": return Piece.Empty;
        case "A": return Piece.Attacker;
        case "D": return Piece.Defender;
        case "C": return Piece.Castle;
        case "K": return Piece.King;
        case "R": return Piece.Refuge;
        case "S": return Piece.Sanctuary;
        case "T": return Piece.Throne;
        default:
            throw new Error();
    }
}

function symbol(a: Piece): string {
    switch (a) {
        case Piece.Empty: return "_";
        case Piece.Attacker: return "A";
        case Piece.Defender: return "D";
        case Piece.Castle: return "C";
        case Piece.King: return "K";
        case Piece.Refuge: return "R";
        case Piece.Sanctuary: return "S";
        case Piece.Throne: return "T";
        default:
            return " ";
    }
}

export function template(strings: TemplateStringsArray): IBoard {
    return strings[0]
        .trim()
        .replace(/ /g, "")
        .split(/\n/g)
        .map((v) => v.split(""))
        .reduce((result, symbols, y) =>
            ({ ...result, ...symbols.reduce((dict, sym, x) =>
                ({ ...dict, [key([x, y])]: piece(sym) }), {}) }), {});
}

export function serialize(s: IBoard): string {
    const result: Piece[][] = [];
    Object.keys(s).forEach((k) => {
        const [x, y] = vec(k);
        if (!Array.isArray(result[y])) {
            result[y] = [];
        }

        result[y][x] = s[k];
    });

    return result.map((r) => r.map(symbol).join(" ")).join("\n");
}

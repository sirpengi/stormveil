import { partition } from "./partition";
import { IBoard } from "./state";
import { Tile } from "./tile";

function flat<T>([first, ...rest]: T[][]): T[] {
    return rest.reduce((result, coll) => result.concat(coll), first);
}

function encode(t: Tile): string {
    switch (t) {
        case Tile.Attk: return "A";
        case Tile.Cast: return "C";
        case Tile.Defn: return "D";
        case Tile.Empt: return "_";
        case Tile.King: return "K";
        case Tile.None: return "N";
        case Tile.Refu: return "R";
        case Tile.Sanc: return "S";
        case Tile.Thrn: return "T";
        default:        return " ";
    }
}

function decode(s: string): Tile {
    switch (s) {
        case "A": return Tile.Attk;
        case "C": return Tile.Cast;
        case "D": return Tile.Defn;
        case "_": return Tile.Empt;
        case "K": return Tile.King;
        case "N": return Tile.None;
        case "R": return Tile.Refu;
        case "S": return Tile.Sanc;
        case "T": return Tile.Thrn;
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

import { partition } from "./partition";
import { IBoard } from "./state";
import { Tile } from "./tile";

function flat<T>([first, ...rest]: T[][]): T[] {
    return rest.reduce((result, coll) => result.concat(coll), first);
}

function encode(t: Tile): string {
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

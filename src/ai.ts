import { IBoard, keyVec, moves, resolve, side } from "./board";
import { Side } from "./side";
import { opponent } from "./state";
import { Tile } from "./tile";

interface IStateTree {
    turn: Side;
    move: [Vector, Vector] | null;
    score: number;
    nodes: IStateTree[];
}

function score(board: IBoard, turn: Side): number {
    const ts = Object.values(board);
    let sum = 0;
    for (const t of ts) {
        if (t === Tile.Empty
            || t === Tile.Throne
            || t === Tile.Refuge
            || t === Tile.None) {
            continue;
        }

        if (side(t) === turn) {
            sum += 1;
        }

        sum -= 1;
    }

    return sum;
}

function createTree(board: IBoard, move: [Vector, Vector] | null, turn: Side, depth: number): IStateTree {
    if (depth > 1) {
        return { turn: turn, move: move, score: score(board, turn), nodes: [] };
    }

    const nodes: IStateTree[] = [];
    const keys = Object.keys(board);
    for (const key of keys) {
        if (side(board[key]) !== turn) {
            continue;
        }

        const kv = keyVec(key);
        const mvs = moves(board, kv);
        if (mvs.length === 0) {
            continue;
        }

        for (const mv of mvs) {
            const b = resolve(board, kv, mv);
            const t = createTree(b, [kv, mv], opponent(turn), depth + 1);
            nodes.push(t);
        }
    }

    return {
        turn: turn,
        move: move,
        score: score(board, turn),
        nodes: nodes,
    };
}

export function createNewTree(board: IBoard, turn: Side): IStateTree {
    return createTree(board, null, turn, 0);
}

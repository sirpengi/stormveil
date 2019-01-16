import { IBoard, moves, resolve, side, vec } from "./board";
import Side from "./side";
import { opponent } from "./state";
import Tile from "./tile";
import { Vector } from "./types/vector";

type Move = [Vector, Vector];

interface IStateNode {
    score: number;
    move: Move | null;
    nodes: IStateNode[];
}

function evaluate(board: IBoard, turn: Side): number {
    let sum = 0;
    let i;
    for (i = 0; i < board.data.length; i += 1) {
        const t = board.data[i];
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

function createTree(board: IBoard, move: Move | null, turn: Side, depth: number): IStateNode {
    const nodes: IStateNode[] = [];
    if (depth > 0) {
        for (let i = 0; i < board.data.length; i += 1) {
            const tile = board.data[i];
            if (side(tile) !== turn) {
                continue;
            }

            const kv = vec(board.width, i);
            const mvs = moves(board, kv);
            if (mvs.length === 0) {
                continue;
            }

            for (const mv of mvs) {
                nodes.push(createTree(resolve(board, kv, mv), [kv, mv], opponent(turn), depth - 1));
            }
        }
    }

    return {
        score: evaluate(board, turn),
        move: move,
        nodes: nodes,
    };
}

function minimax(tree: IStateNode, maximizing: boolean = true): number {
    const { nodes, score } = tree;
    if (nodes.length === 0) {
        return score;
    }

    const fn = maximizing ? Math.max : Math.min;

    let result = maximizing ? -Infinity : Infinity;
    for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        result = fn(result, minimax(node, !maximizing));
    }

    return result;
}

type NodeScoreResult = [IStateNode, number];

function searchBestNode(tree: IStateNode): IStateNode {
    const length = tree.nodes.length;

    let result: NodeScoreResult = [tree.nodes[0], minimax(tree.nodes[0])];
    for (let i = 1; i < length; i += 1) {
        const value = minimax(tree.nodes[i]);
        if (value > result[1]) {
            result = [tree.nodes[i], value];
        }
    }

    return result[0];
}

export function best(board: IBoard, turn: Side, depth: number): Move {
    const tree = createTree(board, null, turn, depth);
    const result = searchBestNode(tree);
    if (result.move == null) {
        throw new Error("Unexpected null move value.");
    }

    return result.move;
}

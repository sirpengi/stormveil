import { IBoard, keyVec, moves, resolve, side } from "./board";
import { Side } from "./side";
import { opponent } from "./state";
import { Tile } from "./tile";

type Move = [Vector, Vector];

interface IStateNode {
    state: IBoard;
    turn: Side;
    move: Move | null;
    nodes: IStateNode[];
}

function score(board: IBoard, turn: Side): number {
    let sum = 0;
    for (const t of Object.values(board)) {
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
                const t = createTree(b, [kv, mv], opponent(turn), depth - 1);
                nodes.push(t);
            }
        }
    }

    return {
        state: board,
        turn: turn,
        move: move,
        nodes: nodes,
    };
}

function minimax(tree: IStateNode, maximizing: boolean = true): number {
    const { nodes, turn, state } = tree;
    if (nodes.length === 0) {
        return score(state, turn);
    }

    const fn = maximizing ? Math.max : Math.min;
    const initialScore: number = maximizing ? -Infinity : Infinity;
    return nodes.reduce((result, node) =>
        fn(result, minimax(node, !maximizing)), initialScore);
}

type NodeScoreResult = [IStateNode, number];

function searchBestNode(tree: IStateNode): IStateNode {
    const [ initialNode, ...rest ] = tree.nodes;
    const initialValue: NodeScoreResult = [initialNode, minimax(initialNode)];
    const [ bestNode ] = rest.reduce<NodeScoreResult>((result, node) => {
        const [ prevNode, prevValue ] = result;
        const value = minimax(node);
        if (value > prevValue) {
            return [node, value];
        }

        return [prevNode, prevValue];
    }, initialValue);

    return bestNode;
}

export function best(board: IBoard, turn: Side, depth: number): Move {
    const tree = createTree(board, null, turn, depth);
    const result = searchBestNode(tree);
    if (result.move == null) {
        throw new Error("Unexpected null move value.");
    }

    return result.move;
}

import { capturable, IBoard, moves, opponent, resolve, team, vec } from "./state";
import { Team } from "./team";
import { Vector } from "./types/vector";

type Move = [Vector, Vector];

function evaluate(board: IBoard, turn: Team): number {
    let sum = 0;
    for (let i = 0; i < board.tiles.length; i += 1) {
        const t = board.tiles[i];
        const s = team(t);
        if (!capturable(t)) {
            continue;
        }

        if (turn === s) {
            sum = sum + 1;
            continue;
        }

        sum = sum - 1;
    }

    return sum;
}

function iterate(board: IBoard, turn: Team, fn: (a: Vector, b: Vector) => void): void {
    for (let i = 0; i < board.tiles.length; i += 1) {
        const t = board.tiles[i];
        if (team(t) !== turn) {
            continue;
        }

        const a = vec(board.width, i);
        const bs = moves(board, a);
        if (bs.length === 0) {
            continue;
        }

        for (let j = 0; j < bs.length; j += 1) {
            fn(a, bs[j]);
        }
    }
}

function minimax(board: IBoard, turn: Team, depth: number, maximizing: boolean): number {
    const adversary = opponent(turn);
    if (depth === 0) {
        return evaluate(board, adversary);
    }

    const compare = maximizing ? Math.max : Math.min;
    let result = maximizing ? -Infinity : Infinity;
    iterate(board, turn, (a, b) => {
        result = compare(result, minimax(resolve(board, a, b), adversary, depth - 1, !maximizing));
    });

    return result;
}

function search(board: IBoard, turn: Team, depth: number): Move {
    let result: Move | null = null;
    let r = -Infinity;
    iterate(board, turn, (a, b) => {
        const v = minimax(resolve(board, a, b), opponent(turn), depth - 1, false);
        if (v > r) {
            r = v;
            result = [a, b];
        }
    });

    if (result == null) {
        throw new Error();
    }

    return result;
}

export function best(board: IBoard, turn: Team, depth: number): Move {
    return search(board, turn, depth);
}

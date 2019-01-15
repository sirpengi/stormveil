import { IBoard, resolve } from "./board";
import Side from "./side";

interface IOptions {
    board: IBoard;
    start: Side;
}

interface ISimpleState {
    board: IBoard;
    turn: Side;
}

interface IMove {
    a: Vector;
    b: Vector;
}

export interface IState extends ISimpleState {
    history: IMove[];
    initial: ISimpleState;
}

export function opponent(side: Side): Side {
    switch (side) {
        case Side.Attackers:
            return Side.Defenders;
        case Side.Defenders:
            return Side.Attackers;
        case Side.None:
            throw new Error();
    }
}

export function createNew(options: IOptions): IState {
    return {
        board: options.board,
        turn: options.start,
        history: [],
        initial: {
            board: options.board,
            turn: options.start,
        },
    };
}

export function play(s: IState, a: Vector, b: Vector): IState {
    const nextState = { ...s };
    nextState.board = resolve(nextState.board, a, b);
    nextState.turn = opponent(nextState.turn);
    nextState.history = nextState.history.concat({ a, b });
    return nextState;
}

import { IBoard, resolve } from "./board";
import { Side } from "./side";
import { IState, opponent } from "./state";

type Listener = () => void;

type Unsubscriber = () => void;

interface IOptions {
    readonly board: IBoard;
    readonly start: Side;
}

interface IGame {
    getState: () => IState;
    play: (a: Vector, b: Vector) => void;
    subscribe: (fn: Listener) => Unsubscriber;
}

export function createNew(options: IOptions): IGame {
    let listeners: Listener[] = [];
    let currentState: IState = {
        board: options.board,
        start: options.start,
        turn: options.start,
    };

    function getState(): IState {
        return currentState;
    }

    function play(a: Vector, b: Vector): void {
        const prevState = getState();
        currentState = {
            ...prevState,
            board: resolve(prevState.board, a, b),
            turn: opponent(prevState.turn),
        };

        listeners.forEach((listener) => {
            listener();
        });
    }

    function subscribe(fn: Listener): Unsubscriber {
        listeners.push(fn);

        function unsubscribe(): void {
            listeners = [];
        }

        return unsubscribe;
    }

    return {
        getState,
        play,
        subscribe,
    };
}

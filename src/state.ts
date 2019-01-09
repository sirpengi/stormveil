import { IBoard } from "./board";
import { Side } from "./side";

export interface IState {
    readonly board: IBoard;
    readonly turn: Side;
    readonly start: Side;
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

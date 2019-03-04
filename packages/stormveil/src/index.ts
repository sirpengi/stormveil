import { unmarshal } from "./serialization";
import { IOptions } from "./shell";
import { IState } from "./state";
export { IState, play } from "./state";
export { Team } from "./team";
export { Tile } from "./tile";

export function createNew(options: IOptions): IState {
    const board = unmarshal(options.board);
    return {
        board: board,
        turn: options.start,
        history: [],
        initial: {
            board: board,
            turn: options.start,
        },
    };
}

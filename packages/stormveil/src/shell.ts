import { IState, moveable, moves as movesfoo, vec } from "./state";
import { Team } from "./team";
import { Vector } from "./types/vector";
export { best } from "./ai";
export { team } from "./state";

export interface IOptions {
    board: string;
    start: Team;
}

export function tiles(state: IState) {
    return state.board.tiles.map((tile, i) => {
        const [ x, y ] = vec(state.board.width, i);
        return { x, y, t: tile, i: state.initial.board.tiles[i] };
    });
}

export function turn(state: IState) {
    return state.turn;
}

export function candidates(state: IState, team: Team) {
    return moveable(state.board, team);
}

export function moves(state: IState, xy: Vector) {
    return movesfoo(state.board, xy);
}

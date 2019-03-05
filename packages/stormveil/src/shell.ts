import { IState, moveable, moves as movesfoo, vec } from "./state";
import { Team } from "./team";
import { Vector } from "./types/vector";
import { Tile } from "./tile";
export { best } from "./ai";
export { team } from "./state";

export interface IOptions {
    board: string;
    start: Team;
}

export interface ITile {
    x: number;
    y: number;
    t: Tile;
    i: Tile;
    k: number;
}

export function tiles(state: IState): ITile[] {
    return state.board.tiles.map((tile, i) => {
        const [ x, y ] = vec(state.board.width, i);
        return {
            x: x,
            y: y,
            t: tile,
            i: state.initial.board.tiles[i],
            k: 42,
        };
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

import { best } from "./ai";
import { unmarshal } from "./serialization";
import { IState, vec, moveable, moves, play, victor } from "./state";
import { Team } from "./team";
import { Tile } from "./tile";
import { Vector } from "./types/vector";

export interface IOptions {
    board: string;
    start: Team;
}

export class Shell {
    public readonly team = Team;
    public readonly tile = Tile;
    private state: IState | null = null;

    constructor(options: IOptions) {
        const board = unmarshal(options.board);
        this.state = {
            board: board,
            turn: options.start,
            history: [],
            initial: {
                board: board,
                turn: options.start,
            },
        };
    }

    public play(a: Vector, b: Vector): this {
        this.state = play(this.getState(), a, b);
        return this;
    }

    public candidates(t: Team): Vector[] {
        return moveable(this.getState().board, t);
    }

    public moves(a: Vector): Vector[] {
        return moves(this.getState().board, a);
    }

    public best(t: Team, depth: number = 3): [Vector, Vector] {
        return best(this.getState().board, t, depth);
    }

    public board(): Array<{ x: number, y: number, t: Tile, i: Tile }> {
        const state = this.getState();
        return state.board.tiles.map((t, i) => {
            const [ x, y ] = vec(state.board.width, i);
            return { x, y, t, i: state.initial.board.tiles[i] };
        });
    }

    public turn(): Team {
        return this.getState().turn;
    }

    public victor(): Team | null {
        return victor(this.getState().board);
    }

    private getState(): IState {
        if (this.state === null) {
            throw new Error();
        }

        return this.state;
    }
}

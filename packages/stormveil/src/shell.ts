import { best } from "./ai";
import { partition } from "./partition";
import { IState, moveable, moves, play, unmarshal, victor } from "./state";
import { Team } from "./team";
import { Tile } from "./tile";
import { Vector } from "./types/vector";

export interface IOptions {
    board: string;
    start: Team;
}

export class Shell {
    public readonly side = Team;
    public readonly tile = Tile;
    private state: IState | null = null;

    constructor(options: IOptions) {
        const board = unmarshal(options.board);
        this.state = {
            board: board,
            turn: options.start,
            history: [],
            victor: null,
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

    public board(): Tile[][] {
        const state = this.getState();
        return partition(state.board.tiles, state.board.width);
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

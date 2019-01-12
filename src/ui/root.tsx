import React from "react";
import css from "classnames";
import { encode, keyVec, unmarshal } from "../board";
import { Side } from "../side";
import { createNew, IState } from "../state";
import { Tile } from "../tile";

interface IRootState {
    game: IState;
}

export default class Root extends React.Component<{}, IRootState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            game: createNew({
                start: Side.Attackers,
                board: unmarshal(`
                    R _ _ A A A A A _ _ R
                    _ _ _ _ _ A _ _ _ _ _
                    _ _ _ _ _ _ _ _ _ _ _
                    A _ _ _ _ D _ _ _ _ A
                    A _ _ _ D D D _ _ _ A
                    A A _ D D C D D _ A A
                    A _ _ _ D D D _ _ _ A
                    A _ _ _ _ D _ _ _ _ A
                    _ _ _ _ _ _ _ _ _ _ _
                    _ _ _ _ _ A _ _ _ _ _
                    R _ _ A A A A A _ _ R
                `),
            }),
        };
    }

    public getState() {
        return this.state.game;
    }

    public board() {
        const result: Tile[][] = [];
        Object.entries(this.getState().board).forEach(([key, tile]) => {
            const [x, y] = keyVec(key);
            if (!Array.isArray(result[y])) {
                result[y] = [];
            }

            result[y][x] = tile;
        });

        return result;
    }

    public encode(t: Tile): string {
        switch (t) {
            case Tile.Empty:
                return " ";
            default:
                return encode(t);
        }
    }

    public renderParticipant = (s: Side) => {
        const t = this.getState().turn;
        const classNames = css({
            "MatchElements__Participant": true,
            "MatchElements__Participant--active": s === t,
        });

        return (
            <div key={s} className={classNames}>
                {Side[s]}
            </div>
        );
    }

    public renderParticipants = () => (
        <div className="MatchElements__Participants">
            {[Side.Attackers, Side.Defenders].map(this.renderParticipant)}
        </div>
    )

    public renderTiles() {
        return this.board().map((row, i) => (
            <div key={i} className="MatchElements__BoardTileRow">
                {row.map((tile, j) => (
                    <div key={j} className="MatchElements__BoardTile">
                        {this.encode(tile)}
                    </div>
                ))}
            </div>
        ));
    }

    public render() {
        return (
            <div className="MatchElements">
                {this.renderParticipants()}
                <div>Hello</div>
                <div className="MatchElements__Board">
                    {this.renderTiles()}
                </div>
            </div>
        );
    }
}

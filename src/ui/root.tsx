import css from "classnames";
import React from "react";
import { encode, unmarshal } from "../board";
import hnefatafl from "../boards/hnefatafl";
import partition from "../partition";
import Side from "../side";
import { createNew, IState } from "../state";
import Tile from "../tile";

interface IRootState {
    game: IState;
}

export default class Root extends React.Component<{}, IRootState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            game: createNew({
                board: unmarshal(hnefatafl),
                start: Side.Defenders,
            }),
        };
    }

    public render() {
        return (
            <div>
                <div className="MatchElements">
                    <div className="MatchElements__Participants">
                        {this.renderParticipants()}
                    </div>
                    <div className="MatchElements__Board">
                        {this.renderBoard()}
                    </div>
                </div>
            </div>
        );
    }

    private renderParticipants() {
        const { turn } = this.getState();
        return [Side.Attackers, Side.Defenders].map(side => (
            <div className={css({
                "MatchElements__Participant": true,
                "MatchElements__Participant--active": turn === side,
            })}>
                {Side[side]}
            </div>
        ));
    }

    private renderBoard() {
        return this.board().map((row, y) => {
            const content = row.map((tile, x) => {
                return (
                    <div className="MatchElements__BoardTile">
                        {this.encode(tile)}
                    </div>
                );
            });

            return (
                <div className="MatchElements__BoardTileRow">
                    {content}
                </div>
            );
        });
    }

    private getState = (): IState =>
        this.state.game

    private encode = (t: Tile): string => {
        switch (t) {
            case Tile.Empty:    return " ";
            default:            return encode(t);
        }
    }

    private board = (): Tile[][] => partition(
        this.getState().board.data,
        this.getState().board.width,
    )
}

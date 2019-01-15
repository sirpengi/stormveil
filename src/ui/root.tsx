import css from "classnames";
import React from "react";
import { encode, unmarshal } from "../board";
import hnefatafl from "../boards/hnefatafl";
import partition from "../partition";
import Side from "../side";
import { createNew, IState, play } from "../state";
import Tile from "../tile";

interface IRootState {
    game: IState;
    selected: Vector | false;
}

export default class Root extends React.Component<{}, IRootState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            game: createNew({
                board: unmarshal(hnefatafl),
                start: Side.Defenders,
            }),
            selected: false,
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

    private onSelect = (x: number, y: number): void => {
        if (this.state.selected === false) {
            this.setState({ selected: [x, y] });
            return;
        }

        this.onPlay(this.state.selected, [x, y]);
        this.setState({ selected: false });
    }

    private onPlay = (a: Vector, b: Vector): void => {
        const s = play(this.getState(), a, b);
        this.setState({ game: s });
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
        const { selected } = this.state;
        return this.board().map((row, y) => {
            const content = row.map((tile, x) => (
                <div className={css({
                    "MatchElements__BoardTile": true,
                    "MatchElements__BoardTile--selected": selected &&
                        selected[0] === x &&
                        selected[1] === y,
                })}
                    onClick={() => this.onSelect(x, y)}>
                    {this.encode(tile)}
                </div>
            ));

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

import css from "classnames";
import React from "react";
import { best } from "stormveil/lib/ai";
import { encode, moveable, moves, unmarshal } from "stormveil/lib/board";
import hnefatafl from "stormveil/lib/boards/hnefatafl";
import partition from "stormveil/lib/partition";
import Side from "stormveil/lib/side";
import { createNew, IState, play } from "stormveil/lib/state";
import Tile from "stormveil/lib/tile";

type Vector = [number, number];

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
        const { selected } = this.state;
        if (selected === false) {
            this.setState({ selected: [x, y] });
            return;
        }

        const [ sx, sy ] = selected;
        if (sx === x && sy === y) {
            this.setState({ selected: false });
            return;
        }

        this.onPlay(selected, [x, y]);
        this.setState({ selected: false });
        window.setTimeout(() => {
            this.onAI();
        }, 500);
    }

    private onAI = () => {
        const { game } = this.state;
        const move = best(game.board, game.turn, 3);
        if (move == null) {
            throw new Error("");
        }

        const [ a, b ] = move;
        this.onPlay(a, b);
    }

    private onPlay = (a: Vector, b: Vector): void => {
        this.setState({ game: play(this.state.game, a, b) });
    }

    private renderParticipants() {
        const { game: { turn } } = this.state;
        return [Side.Attackers, Side.Defenders].map(side => (
            <div key={side} className={css({
                "MatchElements__Participant": true,
                "MatchElements__Participant--active": turn === side,
            })}>
                {Side[side]}
            </div>
        ));
    }

    private renderBoard() {
        return this.board().map((row, y) => (
            <div key={y} className="MatchElements__BoardTileRow">
                {row.map((tile, x) =>
                    this.renderTile(x, y, tile))}
            </div>
        ));
    }

    private renderTile = (x: number, y: number, t: Tile) => {
        const isSelectable = this.isSelectable([x, y]);
        const isSelected = this.isSelected([x, y]);
        return (
            <div key={x} className={css({
                "MatchElements__BoardTile": true,
                "MatchElements__BoardTile--selectable": isSelectable,
                "MatchElements__BoardTile--selected": isSelected,
            })}
                onClick={() => (isSelected || isSelectable) && this.onSelect(x, y)}>
                {this.renderTileName(t)}
            </div>
        );
    }

    private renderTileName = (t: Tile): string => {
        switch (t) {
            case Tile.Empty:    return " ";
            default:            return encode(t);
        }
    }

    private isSelectable = ([x, y]: Vector): boolean => {
        const { game, selected } = this.state;
        if (this.side() !== game.turn) {
            return false;
        }

        if (selected === false) {
            return moveable(game.board, this.side())
                .some(([ vx, vy ]) => vx === x && vy === y);
        }

        const [ sx, sy ] = selected;
        return moves(game.board, [sx, sy])
            .some(([ vx, vy ]) => vx === x && vy === y);
    }

    private isSelected = ([x, y]: Vector): boolean => {
        const { selected } = this.state;
        if (selected === false) {
            return false;
        }

        const [ sx, sy ] = selected;
        return sx === x && sy === y;
    }

    private side = () =>
        Side.Defenders

    private board = (): Tile[][] => partition(
        this.state.game.board.data,
        this.state.game.board.width,
    )
}

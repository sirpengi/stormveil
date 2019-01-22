import css from "classnames";
import React from "react";
import { createNew, State, Team, Tile } from "stormveil";
import { hnefatafl } from "stormveil/lib/boards";

type Vector = [number, number];

interface IRootState {
    game: State;
    team: number;
    selected: Vector | false;
}

export default class Root extends React.Component<{}, IRootState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            game: createNew({
                board: hnefatafl,
                start: Team.Defenders,
            }),
            team: Team.Defenders,
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
                    {this.renderVictor()}
                </div>
            </div>
        );
    }

    private renderParticipants() {
        const { game } = this.state;
        return [Team.Attackers, Team.Defenders].map(team => (
            <div key={team} className={css({
                "MatchElements__Participant": true,
                "MatchElements__Participant--active": game.turn() === team,
            })}>
                {game.team[team]}
            </div>
        ));
    }

    private renderBoard() {
        const { game } = this.state;
        return game.board().map((row, y) => (
            <div key={y} className="MatchElements__BoardTileRow">
                {row.map((tile, x) =>
                    this.renderTile(x, y, tile))}
            </div>
        ));
    }

    private renderTile = (x: number, y: number, t: Tile) => {
        const isVictory = this.isVictorDeclared();
        const isSelectable = this.isSelectable([x, y]);
        const isSelected = this.isSelected([x, y]);
        return (
            <div key={x} className={css({
                "MatchElements__BoardTile": true,
                "MatchElements__BoardTile--selectable": isSelectable && !isVictory,
                "MatchElements__BoardTile--selected": isSelected,
            })}
                onClick={() => ((isSelected || isSelectable) && !isVictory) && this.onSelect(x, y)}>
                {this.renderTileName(t)}
            </div>
        );
    }

    private renderTileName = (t: Tile): string => {
        switch (t) {
            case Tile.Attacker:    return "A";
            case Tile.Castle:      return "C";
            case Tile.Defender:    return "D";
            case Tile.Empty:       return " ";
            case Tile.King:        return "K";
            case Tile.None:        return "N";
            case Tile.Refuge:      return "R";
            case Tile.Sanctuary:   return "S";
            case Tile.Throne:      return "T";
            default:               return " ";
        }
    }

    private renderVictor() {
        const { game } = this.state;
        const victor = game.victor();
        if (victor === null) {
            return null;
        }

        return (
            <div className="MatchElements__Victor">
                {Team[victor]} wins!
            </div>
        );
    }

    private onSelect = (x: number, y: number): void => {
        const { game, selected } = this.state;
        if (selected === false) {
            this.setState({ selected: [x, y] });
            return;
        }

        const [ sx, sy ] = selected;
        if (sx === x && sy === y) {
            this.setState({ selected: false });
            return;
        }

        this.setState({ game: game.play(selected, [x, y]), selected: false });
        if (this.isVictorDeclared()) {
            return;
        }

        window.setTimeout(() => {
            const move = game.best(game.turn(), 3);
            const [ a, b ] = move;
            this.setState({ game: this.state.game.play(a, b) });
        }, 500);
    }

    private isSelectable = ([x, y]: Vector): boolean => {
        const { game, selected, team } = this.state;
        if (game.turn() !== team) {
            return false;
        }

        if (selected === false) {
            return game.candidates(team)
                .some(([ vx, vy ]) =>
                    vx === x && vy === y);
        }

        const [ sx, sy ] = selected;
        return game.moves([sx, sy])
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

    private isVictorDeclared = (): boolean => {
        return this.state.game.victor() !== null;
    }
}

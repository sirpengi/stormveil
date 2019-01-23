import css from "classnames";
import * as Color from "d3-color";
import * as Scale from "d3-scale";
import React from "react";
import { createNew, State, Team, Tile } from "stormveil";
import { hnefatafl } from "stormveil/lib/boards";
import { noise } from "./noise";

interface IRootState {
    game: State;
    team: number;
    selected: [number, number] | false;
}

enum Face {
    Overlay,
    Top,
    Left,
    Right,
}

export default class Root extends React.Component<{}, IRootState> {
    private camera = { a: 12, s: 30, z: 16 };

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
        const { game } = this.state;
        return (
            <div className="Layout_Content">
                <div className="Match_Participants Layout_Header">
                    {[Team.Attackers, Team.Defenders].map(team => {
                        return (
                            <div key={team} className={css({
                                "Match_Participant": true,
                                "Match_Participant--Playing": team === game.turn()
                            })}>
                                <div className="Match_Participant_Title">
                                    {Team[team]}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <svg className="Match_Board" height="420" width="660">
                    <g transform="translate(330, 40)">
                        {this.renderTiles()}
                    </g>
                </svg>
            </div>
        );
    }

    private renderTiles() {
        const { game } = this.state;
        return game.board().map(({ x, y, t }) => {
            const [ tx, ty ] = this.getTilePosition(x, y);
            return (
                <g key={[x, y].join(", ")}
                    onClick={() => this.onSelectTile(x, y)}
                    className={css({
                        "Board_Tile": true,
                        "Board_Tile--Selectable": this.isSelectable(x, y),
                        "Board_Tile--Selected": this.isSelected(x, y),
                    })}
                    style={{ transform: `translate(${tx}px, ${ty}px)` }}>
                    <g className="Board_Tile_Faces">
                        {[Face.Top, Face.Overlay, Face.Left, Face.Right].map(face => {
                            const classNames = css(
                                `Board_Tile_Face`,
                                `Board_Tile_Face--${Face[face]}`
                            );
                            const color = this.getFaceColor(x, y, face).toString();
                            return (
                                <polygon
                                    className={classNames}
                                    key={face}
                                    style={{ fill: color }}
                                    points={this.getFacePath(x, y, face).join(", ")}>
                                </polygon>
                            );
                        })}
                    </g>
                    <g className="Board_Tile_Content">{this.renderTile(t)}</g>
                </g>
            );
        });
    }

    private renderTile = (t: Tile) => {
        switch (t) {
            case Tile.Attacker:
                return (
                    <g transform="translate(-7, -7)">
                        <line x1="0" y1="0" x2="14" y2="14" stroke="black" strokeWidth="2" />
                        <line x1="0" y1="14" x2="14" y2="0" stroke="black" strokeWidth="2" />
                    </g>
                );
            case Tile.Defender:
                return ( <circle r="7" stroke="white" fill="none" strokeWidth="2" /> );
            case Tile.King:
                return ( <circle r="8" stroke="white" fill="none" strokeWidth="4" /> );
            case Tile.Castle:
                return ( <circle r="8" stroke="white" fill="none" strokeWidth="4" /> );
            case Tile.Throne:
            case Tile.Refuge:
            case Tile.Sanctuary:
            default:
                return null;
        }
    }

    private getTileColor = (x: number, y: number): Color.HSLColor => {
        const n = noise(x, y, 5, 3, 0.035);
        const s = (range: [number, number]) =>
            Scale.scaleLinear().domain([0, 1]).range(range)(n);

        if (this.isStartingTile(x, y)) {
            return Color.hsl(40, 0.18, s([0.40, 0.50]), 1);
        }

        return Color.hsl(120, 0.20, s([0.40, 0.45]), 1);
    }

    private getFaceColor = (x: number, y: number, face: Face): Color.Color => {
        const color = this.getTileColor(x, y);
        switch (face) {
            case Face.Overlay:
                return color.brighter(1);
            case Face.Top:
                return color;
            case Face.Left:
                return color.darker(1);
            case Face.Right:
                return color.darker(2.5);
        }
    }

    private getFacePath = (x: number, y: number, face: Face) => {
        const { a, s, z: zi } = this.camera;
        const isInitial = this.isStartingTile(x, y);
        const z = isInitial ? zi + 4 : zi;
        switch (face) {
            case Face.Overlay:
            case Face.Top:
                return [0, -s + a, s, 0, 0, s - a, -s, 0];
            case Face.Left:
                return [-s, 0, -s, z, 0, (s - a) + z, 0, (s - a)];
            case Face.Right:
                return [s, 0, s, z, 0, (s - a) + z, 0, (s - a)];
        }
    }

    private getTilePosition = (x: number, y: number) => {
        const { a, s, z: zi } = this.camera;
        const xpos = (x - y) * s;
        const ypos = (x + y) * (s - a);
        const zpos = this.isStartingTile(x, y) ? zi + 4 : zi;
        return [xpos, ypos - zpos];
    };

    private onSelectTile = (x: number, y: number): void => {
        const { game, selected } = this.state;
        if (this.isSelected(x, y)) {
            this.setState({ selected: false });
        }

        if (!this.isSelectable(x, y)) {
            return;
        }

        if (selected === false) {
            this.setState({ selected: [x, y] });
            return;
        }

        this.setState({ game: game.play(selected, [x, y]), selected: false });
        if (this.isVictorDeclared()) {
            return;
        }

        window.setTimeout(() => {
            const move = game.best(game.turn(), 3);
            const [ a, b ] = move;
            this.setState({ game: game.play(a, b) });
        }, 500);
    }

    private isSelectable = (x: number, y: number): boolean => {
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

    private isSelected = (x: number, y: number): boolean => {
        const { selected } = this.state;
        if (selected === false) {
            return false;
        }

        const [ sx, sy ] = selected;
        return sx === x && sy === y;
    }

    private isStartingTile = (x: number, y: number): boolean =>
        this.state.game.board(true).some(
            t =>
                t.x === x &&
                t.y === y &&
                t.t !== Tile.Empty
        );

    private isVictorDeclared = (): boolean => {
        return this.state.game.victor() !== null;
    }
}

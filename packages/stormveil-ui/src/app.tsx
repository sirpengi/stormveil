import css from "classnames";
import React from "react";
import { CSSTransition } from "react-transition-group";
import { createNew, IState, play, Team } from "stormveil";
import { hnefatafl } from "stormveil/lib/boards";
import { best } from "stormveil/lib/shell";
import Board from "./board";
import { Vector } from "./common";

interface IComponentState {
    game: IState;
    selected: Vector | null;
    started: boolean;
    team: Team;
}

function oppose<T>(a: T, b: T, v: T) {
    if (v === a) {
        return b;
    }

    return a;
}

function teamName(team: Team): string {
    switch (team) {
        case Team.Attackers:
            return "Attackers";
        case Team.Defenders:
            return "Defenders";
        default:
            return "";
    }
}

export default class App extends React.Component<{}, IComponentState> {
    public state = {
        game: createNew({ board: hnefatafl, start: Team.Attackers }),
        selected: null,
        started: false,
        team: Team.Attackers,
    };

    private onStartNew = () => {
        const { team } = this.state;
        this.setState({
            game: createNew({ board: hnefatafl, start: team }),
            started: true,
        });
    }

    private onSelectTeam = (team: Team) => {
        this.setState({ team: team });
    }

    private onSelectTile = (xy: Vector | null) => {
        this.setState({ selected: xy });
    }

    private onMove = (a: Vector, b: Vector) => {
        const { game, team } = this.state;
        const next = play(game, a, b);
        this.setState({ game: next, selected: null });
        window.setTimeout(() => {
            const opponent = oppose(Team.Attackers, Team.Defenders, team);
            const [ ba, bb ] = best(next.board, opponent, 3);
            this.setState({ game: play(next, ba, bb) });
        }, 250);
    }

    private renderBoard = () => {
        const {
            game,
            selected,
            started,
            team,
        } = this.state;

        return (
            <Board
                game={game}
                isStarted={started}
                onMove={this.onMove}
                onSelect={this.onSelectTile}
                selected={selected}
                team={team}
            />
        );
    }

    private renderTeamButton = (team: Team) => {
        switch (team) {
            case Team.Attackers:
                return (
                    <svg width={14} height={32} transform="scale(0.88) rotate(45)">
                        <use href="#sword" />
                    </svg>
                );
            case Team.Defenders:
                return (
                    <svg width={22} height={24}>
                        <use href="#shield" />
                    </svg>
                );
            default:
                return null;
        }
    }

    private renderMenu = () => {
        const { team, started } = this.state;
        return (
            <div className="MainMenu">
                <div className="MainMenuOptions">
                    {!started && (
                        <div className="MainMenuOption">
                            <div className="MainMenuOptionTitle">New game</div>
                            <div className="MainMenuOptionContent TeamButtons">
                                {[Team.Attackers, Team.Defenders].map(t => (
                                    <div
                                        className={css({
                                            "Button": true,
                                            "ButtonTeam": true,
                                            "ButtonSelected": team === t,
                                        })}
                                        onClick={() => this.onSelectTeam(t)}
                                        title={teamName(t)}>
                                        {this.renderTeamButton(t)}
                                    </div>
                                ))}
                                <div
                                    className="Button ButtonStart"
                                    onClick={() => this.onStartNew()}>
                                    Start new game
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="MainMenuOption">
                        <div className="MainMenuOptionTitle">How to play?</div>
                        <div className="MainMenuOptionContent">
                            The objective of the <em>Defenders</em> is to move
                            the <em>King</em> to one of the escape tiles,
                            marked by red flags.
                        </div>
                        <div className="MainMenuOptionContent">
                            The objective of the <em>Attackers</em> is to capture
                            the <em>King</em> by surrounding it on all four sides with
                            attackers.
                        </div>
                        <div className="MainMenuOptionContent">
                            All pieces may move in any of the four directions
                            (North, East, West, and South) any distance, but
                            may not move over other pieces.
                        </div>
                        <div className="MainMenuOptionContent">
                            To capture an <em>Attacker</em> or <em>Defender</em>, it must
                            be sandwiched between two pieces of the opposing team.
                        </div>
                    </div>
                    <div className="MainMenuOption">
                        <div className="MainMenuOptionTitle">About</div>
                        <div className="MainMenuOptionContent">
                            Stormveil is an implementation of an old Nordic
                            board game called Tafl. Visit
                            the <a href="https://en.wikipedia.org/wiki/Tafl_games">Wikiepdia page</a> for
                            more information.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    public render() {
        return (
            <div className="AppView">
                <div className="AppViewPanel">
                    <div className="AppViewContent">
                        <div className="AppViewTitle">Stormveil</div>
                        {this.renderMenu()}
                    </div>
                </div>
                <div className="AppViewBoard">
                    <div className="AppViewContent">
                        <CSSTransition in appear timeout={500} classNames="TransitionFadeIn">
                            <div className="TransitionFadeIn">
                                {this.renderBoard()}
                            </div>
                        </CSSTransition>
                    </div>
                </div>
            </div>
        );
    }
}

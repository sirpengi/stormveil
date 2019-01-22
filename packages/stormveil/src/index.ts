import { IOptions, Shell } from "./shell";
export { Team } from "./team";
export { Tile } from "./tile";

export type State = Shell;

export function createNew(options: IOptions): Shell {
    return new Shell(options);
}

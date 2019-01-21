import { IOptions, Shell } from "./shell";
export { Shell as State } from "./shell";
export { Side as Team } from "./side";
export { Tile } from "./tile";

export function createNew(options: IOptions): Shell {
    return new Shell(options);
}

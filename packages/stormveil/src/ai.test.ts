import test from "tape";
import { best } from "./ai";
import { unmarshal } from "./board";
import Side from "./side";

test.only("", assert => {
    const board = `
        A D _
        _ _ A
    `;

    const result = best(unmarshal(board), Side.Attackers, 4);
    assert.deepEquals(result, [[2, 1], [2, 0]]);
    assert.end();
});

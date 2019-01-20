import test from "tape";
import { best } from "./ai";
import { unmarshal } from "./board";
import { Side } from "./side";

test("Search for the best move", assert => {
    const board = `
        A D _
        _ _ A
    `;

    for (let i = 1; i < 5; i += 1) {
        const result = best(unmarshal(board), Side.Attackers, i);
        assert.deepEquals(result, [[2, 1], [2, 0]]);
    }

    assert.end();
});

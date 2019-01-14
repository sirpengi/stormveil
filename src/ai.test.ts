import test from "tape";
import { best } from "./ai";
import { unmarshal } from "./board";
import hnefatafl from "./boards/hnefatafl";
import { Side } from "./side";

test.skip("Create state tree", assert => {
    console.profile();
    const b = best(unmarshal(hnefatafl), Side.Defenders, 3);
    console.profileEnd();
    assert.end();
});

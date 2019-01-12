import test from "tape";
import { createNewTree } from "./ai";
import { unmarshal } from "./board";
import hnefatafl from "./boards/hnefatafl";
import { Side } from "./side";

test("Create state tree", assert => {
    console.profile("stormveil");
    createNewTree(unmarshal(hnefatafl), Side.Attackers);
    console.profileEnd();
    assert.end();
});

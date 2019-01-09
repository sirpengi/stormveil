import test from "tape";
import { createNew } from "./game";
import { Side } from "./side";
import { template } from "./template";

test("Shallow exercise of 'createNew' and game object interface.", (assert) => {
    const start = Side.Defenders;
    const board = template`
        R _ A _ R
        _ _ D _ _
        A D K D A
        _ _ D _ _
        R _ A _ R
    `;

    const game = createNew({
        board,
        start,
    });

    assert.deepEquals(
        game.getState().board,
        board,
        "Board state is respected by option given in 'createNew'.",
    );

    assert.equals(
        game.getState().start,
        Side.Defenders,
        "Start state is respected by option given in 'createNew'.",
    );

    assert.equals(
        game.getState().turn,
        Side.Defenders,
        "Turn state is initially equal to the 'start' option given in 'createNew'.",
    );

    assert.end();
});

test("Turn state cycles between attackers and defenders.", (assert) => {
    const board = template`
        _ K _ D _
        _ _ _ _ _
        _ D _ A _
        _ _ A _ R
    `;

    const game = createNew({
        board,
        start: Side.Attackers,
    });

    game.play([3, 2], [3, 1]);

    assert.equals(
        game.getState().start,
        Side.Attackers,
        "The 'start' state is immutable."
    );

    assert.equals(
        game.getState().turn,
        Side.Defenders,
        "The 'turn' state is now set to the defenders.",
    );

    assert.end();
});

import test from "tape";
import { IBoard, play, Side, Vector, victor } from "./board";
import { serialize, template } from "./template";

type ITestCasePlay = [string, IBoard, IBoard, Vector, Vector];

type ITestCaseVictor = [string, IBoard, Side | null];

test("Verify plays, including moves and capturing.", (assert) => {
    const tests: ITestCasePlay[] = [
        [
            "Move without capture one space to the east.",
            template`A _`,
            template`_ A`,
            [0, 0],
            [1, 0],
        ],
        [
            "Move without capture one space to the west.",
            template`_ A`,
            template`A _`,
            [1, 0],
            [0, 0],
        ],
        [
            "Move without capture one space to the north.",
            template`_ _ _\n_ K _\n_ _ _`,
            template`_ K _\n_ _ _\n_ _ _`,
            [1, 1],
            [1, 0],
        ],
        [
            "Defender captures an attacker.",
            template`_ A D\nD _ _`,
            template`D _ D\n_ _ _`,
            [0, 1],
            [0, 0],
        ],
        [
            "King moves away from a castle.",
            template`C _ _`,
            template`T K _`,
            [0, 0],
            [1, 0],
        ],
        [
            "King moves away from a sanctuary.",
            template`S _`,
            template`R K`,
            [0, 0],
            [1, 0],
        ],
        [
            "King moves into a refuge.",
            template`R K`,
            template`S _`,
            [1, 0],
            [0, 0],
        ],
        [
            "King moves into a throne.",
            template`T K`,
            template`C _`,
            [1, 0],
            [0, 0],
        ],
        [
            "Attacker must totally surround the king to capture it.",
            template`
                _ K A
                A _ _
            `,
            template`
                A K A
                _ _ _
            `,
            [0, 1],
            [0, 0],
        ],
        [
            "Attacker captures multiple defenders.",
            template`
                A D _ D A
                _ _ A _ _
            `,
            template`
                A _ A _ A
                _ _ _ _ _
            `,
            [2, 1],
            [2, 0],
        ],
        [
            "Defender captures multiple attackers.",
            template`
                _ _ D _ _
                _ _ A _ _
                _ D _ A D
            `,
            template`
                _ _ D _ _
                _ _ _ _ _
                _ _ D _ D
            `,
            [1, 2],
            [2, 2],
        ],
        [
            "Defender captures an attacker using the king as an anvil.",
            template`
                K A _
                _ _ D
            `,
            template`
                K _ D
                _ _ _
            `,
            [2, 1],
            [2, 0],
        ],
        [
            "Attackers capture the king.",
            template`
                _ A _
                _ K A
                A A _
            `,
            template`
                _ A _
                A _ A
                _ A _
            `,
            [0, 2],
            [0, 1],
        ],
        [
            "Attackers capture the king and a defender.",
            template`
                _ A _ _
                _ D A _
                _ _ K A
                _ A A _
            `,
            template`
                _ A _ _
                _ _ A _
                _ A _ A
                _ _ A _
            `,
            [1, 3],
            [1, 2],
        ],
    ];

    tests.forEach(([message, board, expected, a, b]) => {
        const actual = play(board, a, b);
        assert.deepEquals(
            actual,
            expected,
            message
                + "\n" + "Expected:\n" + serialize(expected)
                + "\n\n" + "Actual:\n" + serialize(actual),
        );
    });

    assert.end();
});

test("Verify victory state by examining the board.", (assert) => {
    const tests: ITestCaseVictor[] = [
        [
            "Attackers win.",
            template`
                A _ _
                _ _ A
                _ D _
            `,
            Side.Attackers,
        ],
        [
            "Defenders win.",
            template`
                S _ A
                D _ _
                _ A A
            `,
            Side.Defenders,
        ],
        [
            "No victor.",
            template`
                K _ _ R
                D _ A _
                D A _ _
            `,
            null,
        ],
    ];

    tests.forEach(([message, board, expected]) => {
        const actual = victor(board);
        assert.equals(actual, expected, message);
    });

    assert.end();
});

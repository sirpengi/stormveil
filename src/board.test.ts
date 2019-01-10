import test from "tape";
import { IBoard, marshal, resolve, unmarshal, victor } from "./board";
import { Side } from "./side";

type ITestCasePlay = [string, IBoard, IBoard, Vector, Vector];

type ITestCaseVictor = [string, IBoard, Side | null];

test("Verify plays, including moves and capturing.", (assert) => {
    const tests: ITestCasePlay[] = [
        [
            "Move without capture one space to the east.",
            unmarshal`A _`,
            unmarshal`_ A`,
            [0, 0],
            [1, 0],
        ],
        [
            "Move without capture one space to the west.",
            unmarshal`_ A`,
            unmarshal`A _`,
            [1, 0],
            [0, 0],
        ],
        [
            "Move without capture one space to the north.",
            unmarshal`_ _ _\n_ K _\n_ _ _`,
            unmarshal`_ K _\n_ _ _\n_ _ _`,
            [1, 1],
            [1, 0],
        ],
        [
            "Defender captures an attacker.",
            unmarshal`_ A D\nD _ _`,
            unmarshal`D _ D\n_ _ _`,
            [0, 1],
            [0, 0],
        ],
        [
            "King moves away from a castle.",
            unmarshal`C _ _`,
            unmarshal`T K _`,
            [0, 0],
            [1, 0],
        ],
        [
            "King moves away from a sanctuary.",
            unmarshal`S _`,
            unmarshal`R K`,
            [0, 0],
            [1, 0],
        ],
        [
            "King moves into a refuge.",
            unmarshal`R K`,
            unmarshal`S _`,
            [1, 0],
            [0, 0],
        ],
        [
            "King moves into a throne.",
            unmarshal`T K`,
            unmarshal`C _`,
            [1, 0],
            [0, 0],
        ],
        [
            "Attacker must totally surround the king to capture it.",
            unmarshal`
                _ K A
                A _ _
            `,
            unmarshal`
                A K A
                _ _ _
            `,
            [0, 1],
            [0, 0],
        ],
        [
            "Attacker captures multiple defenders.",
            unmarshal`
                A D _ D A
                _ _ A _ _
            `,
            unmarshal`
                A _ A _ A
                _ _ _ _ _
            `,
            [2, 1],
            [2, 0],
        ],
        [
            "Defender captures multiple attackers.",
            unmarshal`
                _ _ D _ _
                _ _ A _ _
                _ D _ A D
            `,
            unmarshal`
                _ _ D _ _
                _ _ _ _ _
                _ _ D _ D
            `,
            [1, 2],
            [2, 2],
        ],
        [
            "Defender captures an attacker using the king as an anvil.",
            unmarshal`
                K A _
                _ _ D
            `,
            unmarshal`
                K _ D
                _ _ _
            `,
            [2, 1],
            [2, 0],
        ],
        [
            "Attackers capture the king.",
            unmarshal`
                _ A _
                _ K A
                A A _
            `,
            unmarshal`
                _ A _
                A _ A
                _ A _
            `,
            [0, 2],
            [0, 1],
        ],
        [
            "Attackers capture the king and a defender.",
            unmarshal`
                _ A _ _
                _ D A _
                _ _ K A
                _ A A _
            `,
            unmarshal`
                _ A _ _
                _ _ A _
                _ A _ A
                _ _ A _
            `,
            [1, 3],
            [1, 2],
        ],
        [
            "Defenders may use thrones as anvils.",
            unmarshal`D _ A T`,
            unmarshal`_ D _ T`,
            [0, 0],
            [1, 0],
        ],
        [
            "Attackers may use thrones as anvils.",
            unmarshal`A _ D T`,
            unmarshal`_ A _ T`,
            [0, 0],
            [1, 0],
        ],
        [
            "Defenders may use the castle as an anvil.",
            unmarshal`D _ A C`,
            unmarshal`_ D _ C`,
            [0, 0],
            [1, 0],
        ],
        [
            "Attackers may not use the castle as an anvil.",
            unmarshal`A _ D C`,
            unmarshal`_ A D C`,
            [0, 0],
            [1, 0],
        ],
    ];

    tests.forEach(([message, board, expected, a, b]) => {
        const actual = resolve(board, a, b);
        assert.deepEquals(
            actual,
            expected,
            message
                + "\n" + "Expected:\n" + marshal(expected)
                + "\n\n" + "Actual:\n" + marshal(actual),
        );
    });

    assert.end();
});

test("Verify victory state by examining the board.", (assert) => {
    const tests: ITestCaseVictor[] = [
        [
            "Attackers win.",
            unmarshal`
                A _ _
                _ _ A
                _ D _
            `,
            Side.Attackers,
        ],
        [
            "Defenders win.",
            unmarshal`
                S _ A
                D _ _
                _ A A
            `,
            Side.Defenders,
        ],
        [
            "No victor.",
            unmarshal`
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

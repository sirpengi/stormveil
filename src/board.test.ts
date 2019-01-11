import test from "tape";
import { key, marshal, moves, resolve, unmarshal, victor } from "./board";
import hnefatafl from "./boards/hnefatafl";
import { Side } from "./side";

test("Board captures and moves", (assert) => {
    const tests: Array<[string, BoardTemplate, string, Vector, Vector]> = [
        [
            "Move without capture one space to the east.",
            `A _`,
            `_ A`,
            [0, 0],
            [1, 0],
        ],
        [
            "Move without capture one space to the west.",
            `_ A`,
            `A _`,
            [1, 0],
            [0, 0],
        ],
        [
            "Move without capture one space to the north.",
            `_ _ _\n_ K _\n_ _ _`,
            `_ K _\n_ _ _\n_ _ _`,
            [1, 1],
            [1, 0],
        ],
        [
            "Defender captures an attacker.",
            `_ A D\nD _ _`,
            `D _ D\n_ _ _`,
            [0, 1],
            [0, 0],
        ],
        [
            "King moves away from a castle.",
            `C _ _`,
            `T K _`,
            [0, 0],
            [1, 0],
        ],
        [
            "King moves away from a sanctuary.",
            `S _`,
            `R K`,
            [0, 0],
            [1, 0],
        ],
        [
            "King moves into a refuge.",
            `R K`,
            `S _`,
            [1, 0],
            [0, 0],
        ],
        [
            "King moves into a throne.",
            `T K`,
            `C _`,
            [1, 0],
            [0, 0],
        ],
        [
            "Attacker must totally surround the king to capture it.",
            `
                _ K A
                A _ _
            `,
            `
                A K A
                _ _ _
            `,
            [0, 1],
            [0, 0],
        ],
        [
            "Attacker captures multiple defenders.",
            `
                A D _ D A
                _ _ A _ _
            `,
            `
                A _ A _ A
                _ _ _ _ _
            `,
            [2, 1],
            [2, 0],
        ],
        [
            "Defender captures multiple attackers.",
            `
                _ _ D _ _
                _ _ A _ _
                _ D _ A D
            `,
            `
                _ _ D _ _
                _ _ _ _ _
                _ _ D _ D
            `,
            [1, 2],
            [2, 2],
        ],
        [
            "Defender captures an attacker using the king as an anvil.",
            `
                K A _
                _ _ D
            `,
            `
                K _ D
                _ _ _
            `,
            [2, 1],
            [2, 0],
        ],
        [
            "Attackers capture the king.",
            `
                _ A _
                _ K A
                A A _
            `,
            `
                _ A _
                A _ A
                _ A _
            `,
            [0, 2],
            [0, 1],
        ],
        [
            "Attackers capture the king and a defender.",
            `
                _ A _ _
                _ D A _
                _ _ K A
                _ A A _
            `,
            `
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
            `D _ A T`,
            `_ D _ T`,
            [0, 0],
            [1, 0],
        ],
        [
            "Attackers may use thrones as anvils.",
            `A _ D T`,
            `_ A _ T`,
            [0, 0],
            [1, 0],
        ],
        [
            "Defenders may use the castle as an anvil.",
            `D _ A C`,
            `_ D _ C`,
            [0, 0],
            [1, 0],
        ],
        [
            "Attackers may not use the castle as an anvil.",
            `A _ D C`,
            `_ A D C`,
            [0, 0],
            [1, 0],
        ],
    ];

    tests.forEach(([message, board, expected, a, b]) => {
        const actual = resolve(unmarshal(board), a, b);
        const unmarshaled = unmarshal(expected);
        assert.deepEquals(
            actual,
            unmarshaled,
            message
                + "\n" + "Expected:\n" + marshal(unmarshaled)
                + "\n\n" + "Actual:\n" + marshal(actual),
        );
    });

    assert.end();
});

test("Win conditions", (assert) => {
    const tests: Array<[string, BoardTemplate, Side | null]> = [
        [
            "Attackers win.",
            `
                A _ _
                _ _ A
                _ D _
            `,
            Side.Attackers,
        ],
        [
            "Defenders win.",
            `
                S _ A
                D _ _
                _ A A
            `,
            Side.Defenders,
        ],
        [
            "No victor.",
            `
                K _ _ R
                D _ A _
                D A _ _
            `,
            null,
        ],
    ];

    tests.forEach(([message, board, expected]) => {
        const actual = victor(unmarshal(board));
        assert.equals(actual, expected, message);
    });

    assert.end();
});

test("Generating legal moves", assert => {
    const indexed = (vs: Vector[]) =>
        vs.reduce((r, v) => ({ ...r, [key(v)]: true }), {});

    const tests: Array<[BoardTemplate, Vector, Vector[]]> = [
        [`A D`, [0, 0], []],
        [`A K`, [0, 0], []],
        [`D A`, [0, 0], []],
        [`D K`, [0, 0], []],
        [`D _`, [0, 0], [[1, 0]]],
        [`A _`, [0, 0], [[1, 0]]],
        [`K R`, [0, 0], [[1, 0]]],
        [`K T`, [0, 0], [[1, 0]]],
        [`C R`, [0, 0], [[1, 0]]],
        [`C T`, [0, 0], [[1, 0]]],
        [`S R`, [0, 0], [[1, 0]]],
        [`S T`, [0, 0], [[1, 0]]],
        [`A D _`, [0, 0], []],
        [`D D _`, [0, 0], []],
        [`K D _`, [0, 0], []],
        [`C D _`, [0, 0], []],
        [`S D _`, [0, 0], []],
        [`A _ A`, [0, 0], [[1, 0]]],
        [`A _ D`, [0, 0], [[1, 0]]],
        [`A _ K`, [0, 0], [[1, 0]]],
        [`A _ C`, [0, 0], [[1, 0]]],
        [`A _ S`, [0, 0], [[1, 0]]],
        [`D _ A`, [0, 0], [[1, 0]]],
        [`D _ D`, [0, 0], [[1, 0]]],
        [`D _ K`, [0, 0], [[1, 0]]],
        [`D _ C`, [0, 0], [[1, 0]]],
        [`D _ S`, [0, 0], [[1, 0]]],
        [`K _ A`, [0, 0], [[1, 0]]],
        [`K _ D`, [0, 0], [[1, 0]]],
        [`K _ K`, [0, 0], [[1, 0]]],
        [`K _ C`, [0, 0], [[1, 0]]],
        [`K _ S`, [0, 0], [[1, 0]]],
        [`A _ _`, [0, 0], [[1, 0], [2, 0]]],
        [`D _ _`, [0, 0], [[1, 0], [2, 0]]],
        [`K _ _`, [0, 0], [[1, 0], [2, 0]]],
        [`C _ _`, [0, 0], [[1, 0], [2, 0]]],
        [`S _ _`, [0, 0], [[1, 0], [2, 0]]],
        [`_ A _`, [1, 0], [[2, 0], [0, 0]]],
        [`_ D _`, [1, 0], [[2, 0], [0, 0]]],
        [`_ K _`, [1, 0], [[2, 0], [0, 0]]],
        [`_ C _`, [1, 0], [[2, 0], [0, 0]]],
        [`_ S _`, [1, 0], [[2, 0], [0, 0]]],
        [`_ _ A`, [2, 0], [[1, 0], [0, 0]]],
        [`_ _ D`, [2, 0], [[1, 0], [0, 0]]],
        [`_ _ K`, [2, 0], [[1, 0], [0, 0]]],
        [`_ _ C`, [2, 0], [[1, 0], [0, 0]]],
        [`_ _ S`, [2, 0], [[1, 0], [0, 0]]],
        [hnefatafl, [5, 5], []],
        [hnefatafl, [3, 0], [[2, 0], [1, 0], [3, 1], [3, 2], [3, 3], [3, 4]]],
        [hnefatafl, [4, 4], [[4, 3], [4, 2], [4, 1], [3, 4], [2, 4], [1, 4]]],
    ];

    tests.forEach(([board, vector, expected]) => {
        const actual = moves(unmarshal(board), vector);
        assert.deepEquals(
            indexed(actual),
            indexed(expected),
        );
    });

    assert.end();
});

const parser = require("../parser");
const {UserError} = require("../error");

describe("value", () => {
    test("correct", () => {
        const arg = {
            type: "value",
            values: ["value1", "value2"]
        };
        expect(parser.getParsed(arg, "value1")).resolves.toBe("value1");
    });

    test("invalid value", () => {
        const arg = {
            type: "value",
            values: ["value1", "value2"]
        };
        expect(parser.getParsed(arg, "invalid")).rejects.toThrow(UserError);
    });
});

describe("list", () => {
    test("single number", () => {
        const arg = {
            type: "list"
        };
        expect(parser.getParsed(arg, "1")).resolves.toStrictEqual([1]);
    });
    test("multiple numbers", () => {
        const arg = {
            type: "list"
        };
        expect(parser.getParsed(arg, "1,2,3")).resolves.toStrictEqual([1, 2, 3]);
    });
    test("range", () => {
        const arg = {
            type: "list"
        };
        expect(parser.getParsed(arg, "1-3")).resolves.toStrictEqual([1, 2, 3]);
    });
    test("combined", () => {
        const arg = {
            type: "list"
        };
        expect(parser.getParsed(arg, "1,2,3-5,6")).resolves.toStrictEqual([1, 2, 3, 4, 5, 6]);
    });
    test("character", () => {
        const arg = {
            type: "list"
        };
        expect(parser.getParsed(arg, "a")).resolves.toStrictEqual([]);
    });
    test("invalid range", () => {
        const arg = {
            type: "list"
        };
        expect(parser.getParsed(arg, "1,2-,4")).resolves.toStrictEqual([1, 4]);
    });
});

describe("positiveInteger", () => {
    test("valid number", () => {
        const arg = {type: "positiveInteger"};
        expect(parser.getParsed(arg, "1")).resolves.toBe(1);
    });
    test("character", () => {
        const arg = {type: "positiveInteger"};
        expect(parser.getParsed(arg, "a")).rejects.toThrow(UserError);
    });
    test("negative number", () => {
        const arg = {type: "positiveInteger"};
        expect(parser.getParsed(arg, "-3")).rejects.toThrow(UserError);
    });
    test("min valid", () => {
        const arg = {type: "positiveInteger", min: 0};
        expect(parser.getParsed(arg, "1")).resolves.toBe(1);
    });
    test("min invalid", () => {
        const arg = {type: "positiveInteger", min: 5};
        expect(parser.getParsed(arg, "3")).rejects.toThrow(UserError);
    });
    test("max valid", () => {
        const arg = {type: "positiveInteger", max: 5};
        expect(parser.getParsed(arg, "3")).resolves.toBe(3);
    });
    test("max invalid", () => {
        const arg = {type: "positiveInteger", max: 5};
        expect(parser.getParsed(arg, "7")).rejects.toThrow(UserError);
    });
    test("min max valid", () => {
        const arg = {type: "positiveInteger", min: 1, max: 5};
        expect(parser.getParsed(arg, "3")).resolves.toBe(3);
    });
    test("min max invalid", () => {
        const arg = {type: "positiveInteger", min: 1, max: 5};
        expect(parser.getParsed(arg, "7")).rejects.toThrow(UserError);
    });
});

describe("integer", () => {
    test("valid integer", () => {
        const arg = {type: "integer"};
        expect(parser.getParsed(arg, "1")).resolves.toBe(1);
    });
    test("valid negative number", () => {
        const arg = {type: "integer"};
        expect(parser.getParsed(arg, "-3")).resolves.toBe(-3);
    });
    test("character", () => {
        const arg = {type: "integer"};
        expect(parser.getParsed(arg, "a")).rejects.toThrow(UserError);
    });
    test("min valid", () => {
        const arg = {type: "integer", min: 0};
        expect(parser.getParsed(arg, "1")).resolves.toBe(1);
    });
    test("min invalid", () => {
        const arg = {type: "integer", min: 5};
        expect(parser.getParsed(arg, "3")).rejects.toThrow(UserError);
    });
    test("max valid", () => {
        const arg = {type: "integer", max: 5};
        expect(parser.getParsed(arg, "3")).resolves.toBe(3);
    });
    test("max invalid", () => {
        const arg = {type: "integer", max: 5};
        expect(parser.getParsed(arg, "7")).rejects.toThrow(UserError);
    });
    test("min max valid", () => {
        const arg = {type: "integer", min: 1, max: 5};
        expect(parser.getParsed(arg, "3")).resolves.toBe(3);
    });
    test("min max invalid", () => {
        const arg = {type: "integer", min: 1, max: 5};
        expect(parser.getParsed(arg, "7")).rejects.toThrow(UserError);
    });
});

describe("decimal", () => {
    test("valid decimal", () => {
        const arg = {type: "decimal"};
        expect(parser.getParsed(arg, "1.2")).resolves.toBeCloseTo(1.2);
    });
    test("character", () => {
        const arg = {type: "decimal"};
        expect(parser.getParsed(arg, "a")).rejects.toThrow(UserError);
    });
    test("min valid", () => {
        const arg = {type: "decimal", min: 1.1};
        expect(parser.getParsed(arg, "1.2")).resolves.toBeCloseTo(1.2);
    });
    test("min invalid", () => {
        const arg = {type: "decimal", min: 1.2};
        expect(parser.getParsed(arg, "1.1")).rejects.toThrow(UserError);
    });
    test("max valid", () => {
        const arg = {type: "decimal", max: 1.5};
        expect(parser.getParsed(arg, "1.2")).resolves.toBeCloseTo(1.2);
    });
    test("max invalid", () => {
        const arg = {type: "decimal", max: 1.1};
        expect(parser.getParsed(arg, "1.2")).rejects.toThrow(UserError);
    });
});

describe("char", () => {
    test("valid char", () => {
        const arg = {type: "char"};
        expect(parser.getParsed(arg, "c")).resolves.toBe("c");
    });
    test("invalid char", () => {
        const arg = {type: "char"};
        expect(parser.getParsed(arg, "ab")).rejects.toThrow(UserError);
    });
});

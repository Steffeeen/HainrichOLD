const RANGE_REGEX = /^[0-9]+-[0-9]+$/;
const NUMBER_REGEX = /^[0-9]+$/;

function getParsed(expectedType, arg, min, max) {
    if (!arg) {
        throw `An argument of type ${expectedType} was expected`
    }

    switch (expectedType) {
        case "list":
            return parseList(arg, min, max);
        case "positiveNumber":
            return parsePositiveNumber(arg, min, max);
        case "wholeNumber":
            return parseWholeNumber(arg, min, max);
        case "decimal":
            return parseDecimal(arg, min, max);
        case "char":
            return parseChar(arg);
        case "string":
            return arg;
        case "query":
            return arg;
    }
}

function parseList(arg, min, max) {
    let args = arg.split(",");

    let list = [];

    for (let arg of args) {
        if (arg.match(RANGE_REGEX)) {
            list = list.concat(parseRange(arg, min, max));
        }

        if (arg.match(NUMBER_REGEX)) {
            list.push(parsePositiveNumber(arg, min, max));
        }
    }

    return list;
}

function parseRange(arg, min, max) {
    let range = arg.split("-");

    if (range.length !== 2) {
        throw `${arg}: The argument provided is not a valid range a-b`;
    }

    let lowerBound = Math.min(parseInt(range[0]), parseInt(range[1]));
    let upperBound = Math.max(parseInt(range[0]), parseInt(range[1]));

    if (!lowerBound || !upperBound) {
        throw `${arg}: The argument provided is not a valid range a-b`;
    }

    if (min && min > lowerBound) {
        throw `${arg}: The range must be bigger than or equal to ${min}`;
    }

    if (max && max < upperBound) {
        throw `${arg}: The range must be smaller than or equal to ${max}`;
    }

    let list = [];

    for (let i = lowerBound; i <= upperBound; i++) {
        list.push(i);
    }

    return list;
}

function parsePositiveNumber(arg, min, max) {
    if (!arg.match(NUMBER_REGEX)) {
        throw `${arg}: The argument provided is not a valid positive number`
    }

    let number = parseInt(arg);

    if (min && min > number) {
        throw `${arg}: The number must be bigger than ${min}`;
    }

    if (max && max < number) {
        throw `${arg}: The number must be smaller than ${max}`;
    }

    return number;
}

function parseWholeNumber(arg, min, max) {
    let number = parseInt(arg);

    if (isNaN(number)) {
        throw `${arg}: The argument provided is not a valid whole number`;
    }

    if (min && min > number) {
        throw `${arg}: The number must be bigger than ${min}`;
    }

    if (max && max < number) {
        throw `${arg}: The number must be smaller than ${max}`;
    }

    return number;
}

function parseDecimal(arg, min, max) {
    let number = parseFloat(arg);

    if (isNaN(number)) {
        throw `${arg}: is not a valid decimal number`;
    }

    if (min && min > number) {
        throw `${arg}: The number must be bigger than ${min}`;
    }

    if (max && max < number) {
        throw `${arg}: The number must be smaller than ${max}`;
    }

    return number;
}

function parseChar(arg) {
    if (arg.length === 1) {
        return arg;
    }

    throw `${arg}: is not a valid character`
}

module.exports.getParsed = getParsed;
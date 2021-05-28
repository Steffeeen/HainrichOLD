const {UserError} = require("./error");
const RANGE_REGEX = /^[0-9]+-[0-9]+$/;
const NUMBER_REGEX = /^[0-9]+$/;
const USER_REGEX = /^<@!?(\d+)>$/;
const LIST_REGEX = /^((\d+)|(\d+-\d+))(,((\d+)|(\d+-\d+)))*$/;

async function getParsed(expectedArg, arg) {
    if (!arg) {
        throw new UserError(`An argument of type ${expectedArg.type} was expected`);
    }

    switch (expectedArg.type) {
        case "queueItems":
            return parseQueueItems(expectedArg, arg);
        case "user":
            return parseUser(expectedArg, arg);
        case "value":
            return parseValue(expectedArg, arg);
        case "list":
            return parseList(expectedArg, arg);
        case "positiveInteger":
            return parsePositiveInteger(expectedArg, arg);
        case "integer":
            return parseInteger(expectedArg, arg);
        case "decimal":
            return parseDecimal(expectedArg, arg);
        case "char":
            return parseChar(expectedArg, arg);
        case "string":
            return arg;
        case "query":
            return arg;
    }
}

async function parseQueueItems(expected, arg) {
    let parsingFunctions = [parseQueueItemsAsList, /*parseQueueItemsFromName,*/ parseQueueItemsFromMember, parseQueueItemsFromRegex];
    let value;

    for (let parsingFunction of parsingFunctions) {
        try {
            value = await parsingFunction(expected, arg);
        } catch (e) {
            // error while parsing with the current function, try the next one
            continue;
        }
        // the input was parsed by the current function, break out of the loop
        console.log("the input was correctly parsed by " + parsingFunction.name);
        break;
    }

    if (!value) {
        // none of the functions could parse the input
        throw new UserError("Failed to parse the queue item description");
    }

    return value;
}

async function parseQueueItemsAsList(expected, arg) {
    if (!LIST_REGEX.test(arg)) {
        // not a list
        throw new UserError("The input is not a list");
    }
    expected.min = 1;
    expected.max = musicplayer.getQueueLength();
    return parseList(expected, arg).map(i => i - 1);
}

async function parseQueueItemsFromName(expected, arg) {
    let indices = [];

}

async function parseQueueItemsFromRegex(expected, arg) {
    let regex = new RegExp(arg, "i");
    let indices = [];
    for (let i = 0; i < musicplayer.queue.getSongAmount(); i++) {
        if (regex.test(musicplayer.queue.getQueue()[i].title)) {
            console.log(`${i} matches`);
            indices.push(i);
        }
    }
    if (indices.length === 0) {
        throw new UserError("None of the titles matched");
    }

    return indices;
}

async function parseQueueItemsFromMember(expected, arg) {
    let user = await parseUser(expected, arg);
    let indices = musicplayer.queue.getQueue().reduce((accu, curr, index) => {
        if (curr.member.id === user.id) {
            accu.push(index);
        }
    }, []);

    if (indices.length === 0) {
        throw new UserError("The are no songs from that user in the queue");
    }

    return indices;
}

async function parseUser(expected, arg) {
    let matches = arg.match(USER_REGEX);

    if (!matches) {
        // not a valid user
        throw new UserError("The supplied argument is not a valid user");
    }

    return await client.users.fetch(matches[1], false);
}

function parseValue(expected, arg) {
    if (expected.values.includes(arg)) {
        return arg;
    }
    throw new UserError(`${arg}: The argument provided is not a valid value, valid values are: ${expected.values}`);
}

function parseList(expected, arg) {
    let args = arg.split(",");

    let list = [];

    for (let arg of args) {
        if (arg.match(RANGE_REGEX)) {
            list = list.concat(parseRange(expected, arg));
        }

        if (arg.match(NUMBER_REGEX)) {
            list.push(parsePositiveInteger(expected, arg));
        }
    }

    return list;
}

function parseRange(expected, arg) {
    let range = arg.split("-");

    if (range.length !== 2) {
        throw new UserError(`${arg}: The argument provided is not a valid range a-b`);
    }

    let lowerBound = Math.min(parseInt(range[0]), parseInt(range[1]));
    let upperBound = Math.max(parseInt(range[0]), parseInt(range[1]));

    if (!lowerBound || !upperBound) {
        throw new UserError(`${arg}: The argument provided is not a valid range a-b`);
    }

    if (expected.min && expected.min > lowerBound) {
        throw new UserError(`${arg}: The range must be bigger than or equal to ${expected.min}`);
    }

    if (expected.max && expected.max < upperBound) {
        throw new UserError(`${arg}: The range must be smaller than or equal to ${expected.max}`);
    }

    let list = [];

    for (let i = lowerBound; i <= upperBound; i++) {
        list.push(i);
    }

    return list;
}

function parsePositiveInteger(expected, arg) {
    let number = parseInteger(expected, arg);
    if (number < 0) {
        throw new UserError(`${arg}: The argument provided is not a valid positive number`);
    }

    return number;
}

function parseInteger(expected, arg) {
    let number = parseInt(arg);

    if (isNaN(number)) {
        throw new UserError(`${arg}: The argument provided is not a valid integer`);
    }

    if (expected.min && expected.min > number) {
        throw new UserError(`${arg}: The number must be bigger than ${expected.min}`);
    }

    if (expected.max && expected.max < number) {
        throw new UserError(`${arg}: The number must be smaller than ${expected.max}`);
    }

    return number;
}

function parseDecimal(expected, arg) {
    let number = parseFloat(arg);

    if (isNaN(number)) {
        throw new UserError(`${arg}: is not a valid decimal number`);
    }

    if (expected.min && expected.min > number) {
        throw new UserError(`${arg}: The number must be bigger than ${expected.min}`);
    }

    if (expected.max && expected.max < number) {
        throw new UserError(`${arg}: The number must be smaller than ${expected.max}`);
    }

    return number;
}

function parseChar(expected, arg) {
    if (arg.length === 1) {
        return arg;
    }

    throw new UserError(`${arg}: is not a valid character`);
}

module.exports.getParsed = getParsed;
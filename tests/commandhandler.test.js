const handler = require("../commandhandler");

global.config = {
    ownerID: 258672966617792514,
    modIDs: [
        1
    ],
    prefix: "/",
    textChannel: 484087821909622793,
    passes: 3,
    songCacheLocation: "songs"
};


let sendMessageMock;

beforeEach(() => {
    sendMessageMock = jest.fn();
});

test("missing args", async () => {
    await command("/example");
    expect(sendMessageMock).toHaveBeenCalledWith("Missing arguments: number");
});

test("too many args", async () => {
    await command("/example 5 5");
    expect(sendMessageMock).toHaveBeenCalledWith("example command, number: 5");
});

test("example 5", async () => {
    await command("/example 5");
    expect(sendMessageMock).toHaveBeenCalledWith("example command, number: 5");
});

test("permission level 1", async () => {
    await command("/example sub1");
    expect(sendMessageMock).toHaveBeenCalledWith("sub command sub1");
});

test("insufficient permission for sub command", async () => {
    let msg = message("/example sub2");
    msg.author.id = 1;
    await handler.parseCommand(msg);
    expect(sendMessageMock).toHaveBeenCalledWith("You don't have permission to use this sub command");
});

test("list arg single number", async () => {
    await command("/example sub3 1");
    expect(sendMessageMock).toHaveBeenCalledWith("sub command sub3 with list 1");
});

test("list arg multiple number", async () => {
    await command("/example sub3 1,2,3");
    expect(sendMessageMock).toHaveBeenCalledWith("sub command sub3 with list 1,2,3");
});

test("list arg range", async () => {
    await command("/example sub3 1-3");
    expect(sendMessageMock).toHaveBeenCalledWith("sub command sub3 with list 1,2,3");
});

test("list arg combined", async () => {
    await command("/example sub3 1,2,3-5,6");
    expect(sendMessageMock).toHaveBeenCalledWith("sub command sub3 with list 1,2,3,4,5,6");
});

test("union arg wrong type", async () => {
    await command("/example union abc");
    expect(sendMessageMock).toHaveBeenCalledWith("abc: the provided argument doesn't match any of the following allowed types: value,wholeNumber");
});

test("union arg", async () => {
    await command("/example union 1");
    expect(sendMessageMock).toHaveBeenCalledWith("example union wholeNumber 1");
});

test("union arg", async () => {
    await command("/example union test1");
    expect(sendMessageMock).toHaveBeenCalledWith("example union value test1");
});

async function command(input) {
    return await handler.parseCommand(message(input));
}

function message(content) {
    return {
        author: {
            bot: false,
            id: 258672966617792514
        },
        content: content,
        channel: {
            send(content) {
                return sendMessageMock(content);
            }
        }
    };
}

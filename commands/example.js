module.exports = {
    name: "example",
    description: "a simple example command, that shows the capabilities of the command system",
    aliases: ["ex"],
    permissionLevel: 1,
    args: [
        {
            name: "number",
            type: "wholeNumber",
            permissionLevel: 2,
            min: 1,
            max: 10
        }
    ],
    subcommands: [
        {
            name: "sub1",
            permissionLevel: 1,
            run: (msg) => {
                msg.channel.send("sub command sub1");
            }
        },
        {
            name: "sub2",
            permissionLevel: 2,
            run: (msg) => {
                msg.channel.send("sub command sub2");
            }
        },
        {
            name: "sub3",
            args: [
                {
                    name: "list",
                    type: "list"
                }
            ],
            run: (msg, args) => {
                msg.channel.send(`sub command sub3 with list ${args.list.toString()}`);
            }
        },
        {
            file: "subcommands/sub4.js"
        },
        {
            name: "sub5",
            flags: [
                {
                    name: "test",
                    short: "-t",
                    long: "--test",
                    description: "a simple boolean test flag"
                }
            ],
            run: (msg, args) => {
                msg.channel.send(`sub command sub5, test is ${args.test}`);
            }
        },
        {
            name: "sub6",
            flags: [
                {
                    name: "testList",
                    long: "--test-list",
                    short: "-l",
                    arg: {
                        name: "list",
                        type: "list"
                    },
                    description: "a simple argument flag"
                }
            ],
            run: (msg, args) => {
                msg.channel.send(`sub command sub6, testList is ${args.testList}`);
            }
        },
        {
            name: "sub7",
            flags: [
                {
                    name: "test",
                    long: "--test",
                    short: "-t"
                },
                {
                    name: "aaa",
                    long: "--aaa",
                    short: "-a",
                }
            ],
            run: (msg, args) => {
                msg.channel.send(`sub command sub7, testFlag is ${args.test}, aaa is ${args.aaa}`);
            }
        },
        {
            name: "sub8",
            flags: [
                {
                    name: "listOne",
                    long: "--list-one",
                    short: "-l",
                    arg: {
                        type: "list"
                    }
                },
                {
                    name: "listTwo",
                    long: "--list-two",
                    short: "-a",
                    arg: {
                        type: "list"
                    }
                }
            ],
            run: (msg, args) => {
                msg.channel.send(`sub command sub8, listOne is ${args.listOne}, listTwo is ${args.listTwo}`);
            }
        }
    ],

    run: (msg, args) => {
        msg.channel.send(`example command, number: ${args.number}`);
    }
}
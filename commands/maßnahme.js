const lengths = ["ein-", "zwei-", "drei-", "vier-", "fünf-", "sechs-"];
const timeSpans = ["tägige", "wöchige", "monatige", "fache", "malige"];
const modifiers = ["harte", "softe", "optionale", "intransparente", "alternativlose", "unumkehrbare"];
const actions1 = ["Wellenbrecher-", "Brücken-", "Treppen-", "Wende-", "Impf-", "Ehren-"];
const actions2 = ["Lockdown", "Stopp", "Maßnahme", "Kampagne", "Sprint", "Matrix"]
const ends = ["zum Sommer", "auf Weiteres", "zur Bundestagswahl", "2030", "nach den Abiturprüfungen"];
const reasons1 = ["sofortigen", "nachhaltigen", "allmählichen", "unausweichlichen", "wirtschaftsschonenden", "willkürlichen"];
const reasons2 = ["Senkung", "Steigerung", "Beendigung", "Halbierung", "Vernichtung", "Beschönigung"];
const reasons3 = ["Infektionszahlen", "privaten Treffen", "Wirtschaftsleistung", "Wahlprognosen", "dritten Welle", "Bundeskanzlerin"];

const rActions = ["Lockdown", "Stopp", "Sprint"];

module.exports = {
    name: "maßnahme",
    description: "Würfele eine zufällige Corona-Maßnahme",
    aliases: ["masnahme", "massnahme", "corona"],
    permissionLevel: 0,
    run: (msg, args) => {
        msg.channel.send(generateRandom());
    }
}

function generateRandom() {
    let length = randomFromArray(lengths);
    let timeSpan = randomFromArray(timeSpans);
    let modifier = randomFromArray(modifiers);
    let action1 = randomFromArray(actions1);
    let action2 = randomFromArray(actions2);
    let end = randomFromArray(ends);
    let reason1 = randomFromArray(reasons1);
    let reason2 = randomFromArray(reasons2);
    let reason3 = randomFromArray(reasons3);

    if (rActions.includes(action2)) {
        timeSpan += "r";
        modifier += "r";
    }

    let pronoun = rActions.includes(action2) ? "ein" : "eine";
    return `Was wir jetzt brauchen ist ${pronoun} ${length}${timeSpan} ${modifier} ${action1}${action2} bis ${end} zur ${reason1} ${reason2} der ${reason3}`;
}

function randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}
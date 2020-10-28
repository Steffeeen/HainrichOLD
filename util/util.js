function convertSecondsToTimeString(progress) {
    let result = "";

    let hours = progress / 3600;
    if (hours >= 1) {
        result += addLeadingZero(Math.round(hours));
        result += ":";
    }

    let minutes = Math.floor(progress / 60) % 60
    result += addLeadingZero(minutes);
    result += ":";

    let seconds = progress % 60;
    result += addLeadingZero(seconds);

    return result;
}

function addLeadingZero(number) {
    if (`${number}`.length === 1) {
        return `0${number}`;
    }
    return number;
}

module.exports.convertSecondsToTimeString = convertSecondsToTimeString;
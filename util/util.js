function convertSecondsToTimeString(duration) {
    let result = "";

    let hours = duration / 3600;
    if (hours >= 1) {
        result += addLeadingZero(Math.floor(hours));
        result += ":";
    }

    let minutes = Math.floor(duration / 60) % 60
    result += addLeadingZero(minutes);
    result += ":";

    let seconds = duration % 60;
    result += addLeadingZero(seconds);

    return result;
}

function addLeadingZero(number) {
    if (number < 10) {
        return "0" + number;
    }
    return number;
}

module.exports.convertSecondsToTimeString = convertSecondsToTimeString;
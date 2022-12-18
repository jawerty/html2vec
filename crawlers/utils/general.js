const uuid = require('uuid');
const crypto = require('crypto');

function generateRandomId() {
	return uuid.v4();
}

function getChecksumFromString(str) {
    const shaSum = crypto.createHash('sha1')
    shaSum.update(str)
    return shaSum.digest('hex')
}

function getMiliSecondsFromTimeString(timeString) {
    if (timeString[timeString.length - 1] === "m") {
        const timeNum = timeString.slice(0, -1);
        return parseInt(timeNum) * 60 * 1000
    } else if (timeString[timeString.length - 1] === "h") {
        const timeNum = timeString.slice(0, -1);
        return parseInt(timeNum) * 60 * 60 * 1000
    } else if (timeString[timeString.length - 1] === "d") {
        const timeNum = timeString.slice(0, -1);
        return parseInt(timeNum) * 24 * 60 * 60 * 1000
    } else if (timeString[timeString.length - 1] === "M") {
        return null
    }
    return null
}

module.exports = {
	generateRandomId,
	getChecksumFromString,
	getMiliSecondsFromTimeString
}
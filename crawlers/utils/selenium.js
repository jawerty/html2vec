const { Builder } = require('selenium-webdriver');


function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function setupDriver() {
    try {
        const driver = await new Builder().forBrowser('firefox').build();
        return driver;
    } catch (e) {
        console.log(e);
        return null;
    }
}




module.exports = {
    setupDriver, timeout
}
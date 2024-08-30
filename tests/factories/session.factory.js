const keys = require("../../config/keys");
const Keygrip = require('keygrip');
const Buffer = require('safe-buffer').Buffer;

module.exports = (user) => {
    const sessionObject = {
        passport: {
            user: user._id.toString()
        }
    };
    const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
    const keygrip = new Keygrip([keys.cookieKey]);
    const sig = keygrip.sign('session=' + session);
    return {
        sig,
        session
    };
};
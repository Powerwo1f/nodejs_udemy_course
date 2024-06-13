const {clearHash} = require("../services/cache");

module.exports = async (req, res, next) => {
    await next();

    // will run after request handler
    clearHash(req.user.id);
}
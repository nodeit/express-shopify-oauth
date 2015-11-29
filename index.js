// peer dependencies
var router = require.main.require('express').Router();
var shopifyAPI = require.main.require('shopify-node-api');

module.exports = function(config) {

    var middleware = require('./lib/middleware')(config);

    router.get(config.install_url || '/install', middleware.install);
    router.get(config.confirmed_url || '/finish', middleware.finish);

    return router;

};
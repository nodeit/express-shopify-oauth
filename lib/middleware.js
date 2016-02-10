var _ = require('lodash');
var utils = require('./utils');
var shopifyAPI = require.main.require('shopify-node-api');
var uuid = require('node-uuid');
var debug = require('debug')('express-shopify-oauth:middleware');

module.exports = function(config) {

    return {

        install: function(req, res, next) {

            // clear any old sessions first
            delete req.session.config;

            // require shop information
            var shop = req.query.shop;

            // Shop is required!
            if (!shop) {
                var err = new Error('shop not found');
                err.status = 404;
                return next(err);
            }

            // Create one-time verification value
            // https://docs.shopify.com/api/authentication/oauth#asking-for-permission
            var nonce = uuid.v1();

            // Setup shopify config object
            var shopConfig = _.assign(config.shopify, {
                shop: utils.trimShop(shop),
                nonce: nonce
            });

            debug(`shopConfig ${JSON.stringify(shopConfig, null, 4)}`);

            // setup new shopify instance and save config to session
            var Shopify = new shopifyAPI(shopConfig);

            req.session.config = Shopify.config;

            // render html code that will redirect the user to shopify's login process
            var html = utils.renderRedirectHtml(Shopify.buildAuthURL());
            return res.send(html);

        },

        finish: function(req, res, next) {

            debug(`req.query ${JSON.stringify(req.query, null, 4)}`);
            debug(`req.session.config ${JSON.stringify(req.session.config, null, 4)}`);

            // require session config from install step
            if (!req.session.config || !req.session.config.shop) {
                var err = new Error('Forbidden'); // need to visit /install first
                err.status = 403;
                return next(err)
            }

            // require nonce parameter
            if (!req.query.state ||
                !req.session.config.nonce ||
                req.query.state !== req.session.config.nonce) {
                    var err = new Error('Forbidden: Invalid Signature');
                    err.status = 403
                    return next(err);
            }

            // setup new shopify instance with session config from install step
            var Shopify = new shopifyAPI(req.session.config);
            var shop = req.session.config.shop;

            // remove config so subsequent calls must go through /install first
            delete req.session.config;

            // Request a permanent token from Shopify
            Shopify.exchange_temporary_token(req.query, function(err, data) {
                if (err) return next(err); // non-authentic request

                // pass shop and token back to user and let them handle the response
                config.permanent_token_callback(req, res, shop, data['access_token']);

            });

        }

    };

};

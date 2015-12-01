var _ = require('lodash');
var utils = require('./utils');
var shopifyAPI = require.main.require('shopify-node-api');
var debug = require('debug')('express-shopify-oauth:middleware');

module.exports = function(config) {

    return {

        install: function(req, res) {

            // require shop information
            var shop = req.query.shop;
            if (!shop) return res.sendStatus(403); // Shop is required!

            // setup new shopify instance and save config to session
            var Shopify = new shopifyAPI(_.assign(config.shopify, { shop: utils.trimShop(shop) }));
            req.session.config = Shopify.config;

            // render html code that will redirect the user to shopify's login process
            var html = utils.renderRedirectHtml(Shopify.buildAuthURL());
            return res.send(html);

        },

        finish: function(req, res) {

            // require session config from install step
            if (!req.session.config || !req.session.config.shop)
                return res.sendStatus(403); // need to visit /install first
            
            // setup new shopify instance with session config from install step
            var Shopify = new shopifyAPI(req.session.config);
            var shop = req.session.config.shop;

            // remove config so subsequent calls must go through /install first
            delete req.session.config;
            
            // Request a permanent token from Shopify
            Shopify.exchange_temporary_token(req.query, function(err, data) {
                if (err) return res.sendStatus(403); // non-authentic request
                
                // pass shop and token back to user and let them handle the response
                config.permanent_token_callback(shop, data['access_token'], res);

            });

        }

    };

};

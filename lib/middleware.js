var _ = require('lodash');
var utils = require('./utils');


module.exports = function(config) {

    return {

        install: function(req, res) {
            var shop = req.query.shop;
            if (!shop) return res.sendStatus(403); // Shop is required!
            var Shopify = new shopifyAPI(_.assign(config.shopify, { shop: utils.trimShop(shop) }));
            req.session.config = Shopify.config;
            var html = utils.renderRedirectHtml(Shopify.buildAuthURL());
            return res.send(html);
        },

        finish: function(req, res) {
            if (!req.session.config) return res.sendStatus(403); // need to visit /install first
            var Shopify = new shopifyAPI(req.session.config);
            delete req.session.config;
            Shopify.exchange_temporary_token(req.query, function(err, data) {
                if (err) return res.sendStatus(403); // non-authentic request
                res.sendStatus(200);
                config.permanent_token_callback(data['access_token']);
            });
        }

    };

};

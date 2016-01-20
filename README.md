#express-shopify-oauth

A custom middleware for express that handles the shopify oauth process for you.

## Installation
    npm install express-shopify-oauth

## Features


~~~
# app.js
const express = require('express');
const app = express();

const shopifyOAuth = require('express-shopify-oauth');

app.use(shopifyOauth({
    install_url: '/auth', // OPTIONAL
    confirmed_url: '/auth/finish', // OPTIONAL
    shopify: {
        shopify_api_key: '', // Your API key
        shopify_shared_secret: '', // Your Shared Secret
        shopify_scope: 'write_products',
        redirect_uri: 'https://YOURWEBSITEHERE/auth/finish',
        verbose: false
    },
    permanent_token_callback: function(req, res, shop, token) {
		db.shops.findOneAndActivate(shop, token, err => {
			if (err) return res.sendStatus(500);
			res.redirect('/dashboard'); // handle the response
		});
    }
}));

~~~
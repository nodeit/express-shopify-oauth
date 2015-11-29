var _ = require('lodash');

module.exports = {

    trimShop: function(shop) {
        return shop.split('.')[0]; // remove the .myshopify.com part
    },

    renderRedirectHtml: function(redirect_url) {
        var template = '<script type="text/javascript">window.top.location.href = "${ redirect_url }"</script>';
        var compiled = _.template(template);
        return compiled({ 'redirect_url' : redirect_url });
    }

};
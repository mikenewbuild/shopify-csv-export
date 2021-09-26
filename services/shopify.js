require('dotenv').config();
const Shopify = require('shopify-api-node');

const { API_KEY, PASSWORD, SHOP } = process.env;

module.exports.shopify = new Shopify({
  apiKey: API_KEY,
  password: PASSWORD,
  shopName: SHOP,
  autoLimit: true
});

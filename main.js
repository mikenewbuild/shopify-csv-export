require('dotenv').config();
const { SHOP, RESOURCE, RELATION, FIELDS } = process.env;

// let config = {
//   shop: SHOP,
//   fields: FIELDS.split(','),
//   resource: RESOURCE,
//   relation: RELATION
// }

// require('./resource.js').write(config).catch(console.error());

let config = {
  shop: SHOP
}

require('./prices.js').write(config).catch(console.error());

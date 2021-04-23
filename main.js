require('dotenv').config();

const fs = require('fs');
const { parse } = require('json2csv');
const pluralize = require('pluralize');
const Shopify = require('shopify-api-node');

const { API_KEY, PASSWORD, SHOP, RESOURCE, RELATION, FIELDS } = process.env;

const shopify = new Shopify({
  apiKey: API_KEY,
  password: PASSWORD,
  shopName: SHOP,
  autoLimit: true
});

const csvFields = FIELDS.split(',');
const filename = (RELATION) ? `${RELATION}.csv` : `${RESOURCE}.csv`;
const resourceKey = pluralize.singular(RESOURCE);

const resources = [];

const outputCsv = (data, fields, filename = 'export.csv') => {
  const csv = parse(data, { fields });
  fs.writeFile(filename, csv, (error) => {
    if (error) throw error;
    console.log();
    console.log(`All done! Saved as "${filename}"`);
  });
}

console.log(`Fetching ${RELATION ? RELATION : RESOURCE} (${FIELDS}) from ${SHOP}`);
console.log();

(async () => {
  let params = { limit: 100 };
  if (RELATION) {
    params = { fields: [RELATION], ...params };
  } else {
    params = { fields: csvFields, ...params };
  }

  do {
    const rows = await shopify[resourceKey].list(params);
    if (RELATION) {
      resources.push(...rows.flatMap(row => row[RELATION]));
    } else {
      resources.push(...rows);
    }
    console.log('Fetched......', resources.length);
    params = rows.nextPageParameters;
  } while (params);

  outputCsv(resources, csvFields, filename);
})().catch(console.error);

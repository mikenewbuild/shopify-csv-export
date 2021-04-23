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

const outputCsv = (rows, fields, filename = 'export.csv') => {
  const csv = parse(rows, { fields });
  fs.writeFile(filename, csv, (error) => {
    if (error) throw error;
  });
}

(async () => {
  const rows = [];
  let params = { limit: 100 };
  if (RELATION) {
    params = { fields: [RELATION], ...params };
  } else {
    params = { fields: csvFields, ...params };
  }

  console.log(`Fetching ${RELATION ? RELATION : RESOURCE} (${FIELDS}) from ${SHOP}`);
  console.log();

  do {
    const resources = await shopify[resourceKey].list(params);
    if (RELATION) {
      rows.push(...resources.flatMap(r => r[RELATION]));
    } else {
      rows.push(...resources);
    }

    console.log('Fetched......', rows.length);

    params = resources.nextPageParameters;
  } while (params);

  outputCsv(rows, csvFields, filename);

  console.log();
  console.log(`All done! Saved as "${filename}"`);
})().catch(console.error);

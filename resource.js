const fs = require('fs');
const { parse } = require('json2csv');
const pluralize = require('pluralize');
const { shopify } = require('./shopify.js');

const outputCsv = (rows, fields, filename = 'export.csv') => {
  const csv = parse(rows, { fields });
  fs.writeFile(filename, csv, (error) => {
    if (error) throw error;
  });
}

module.exports.write = async ({ shop, fields, resource, relation = null }) => {
  const filename = (relation) ? `${relation}.csv` : `${resource}.csv`;
  const resourceKey = pluralize.singular(resource);
  const rows = [];
  let params = { limit: 100 };
  if (relation) {
    params = { fields: [relation], ...params };
  } else {
    params = { fields: fields, ...params };
  }

  console.log(`Fetching ${relation ? relation : resource} (${fields}) from ${shop}`);
  console.log();

  do {
    const resources = await shopify[resourceKey].list(params);
    if (relation) {
      rows.push(...resources.flatMap(r => r[relation]));
    } else {
      rows.push(...resources);
    }

    console.log('Fetched......', rows.length);

    params = resources.nextPageParameters;
  } while (params);

  outputCsv(rows, fields, filename);

  console.log();
  console.log(`All done! Saved as "${filename}"`);
}

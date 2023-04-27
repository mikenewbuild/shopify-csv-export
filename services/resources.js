require('dotenv').config();
const pluralize = require('pluralize');
const { shopify } = require('./shopify.js');
const { writeCsv, writeJson } = require('./files.js');
const { SHOP } = process.env;

module.exports.write = async ({ fields, parent_id, resource, relation, extension = 'csv', mutation }) => {
  const name = (relation) ? relation : pluralize.plural(resource);
  const filename = (parent_id) ? `${parent_id}-${name}` : name;
  const key = pluralize.singular(resource);
  const rows = [];
  let params = { limit: 250 };
  if (relation) {
    params = { fields: [relation], ...params };
  } else {
    params = { fields, ...params };
  }

  console.log();
  console.log(`Fetching ${name} (${fields}) from ${SHOP}`);
  console.log();

  do {
    const resources = parent_id ? await shopify[key].list(parent_id, params) : await shopify[key].list(params);
    if (relation) {
      rows.push(...resources.flatMap(r => r[relation]));
    } else {
      rows.push(...resources);
    }

    console.log('Fetched......', rows.length);

    params = resources.nextPageParameters;
  } while (params);

  write(extension, filename, rows);

  if (mutation) {
    write(extension, `mutated.${filename}`, mutation(rows));
  }

  console.log();
  console.log(`** All done! **"`);
}

function write(type, filename, data, fields) {
  if (type === 'json') {
    writeJson({ rows: data, filename });
  } else {
    writeCsv({ rows: data, fields, filename });
  }
}

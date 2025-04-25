const { shopify } = require('./services/shopify.js');
const { writeCsv } = require('./services/files.js');

// Replace this with the string you want to remove from the target URL
// For example, if you want to remove the root domain "https://example.com"
// to make redirects relative
const deleteString = 'https://example.com';

// Set dryRun to true to only write the mutated data to a file without updating the redirects
const dryRun = true;

let config = {
  resource: 'redirect',
  fields: [
    "id",
    "path",
    "target",
  ],
  mutation: (data) => {
    return data.map(row => {
      row.target = row.target.replace(deleteString, '');
      return row;
    })
  },
  extension: 'json',
}

require('./services/resources.js').write(config).then(
  () => !dryRun && mutate()
).catch(console.error());

const fs = require('fs');

function mutate() {

  const { SHOP } = process.env;

  fs.readFile(`./storage/${SHOP}/mutated.redirects.json`, 'utf8', (error, data) => {
    if (error) {
      console.error(error);
      return;
    }

    data = JSON.parse(data);

    data.reverse();

    let index = 0;
    let count = 0;
    let total = data.length;
    let errorRows = [];

    console.log();
    console.log(`** Updating ${total} redirects... **`);
    console.log();

    function handleError(err, item) {
      console.error(`Error: ${item.id} - "${item.path}", "${item.target}"`);
      if (err.code === "ERR_NON_2XX_3XX_RESPONSE") {
        errorRows.push(item);
      } else {
        console.error(err);
      }
    }

    function logErrors() {
      console.log(`Errors found: ${errorRows.length}`);
      if (errorRows.length > 0) {
        writeCsv({ rows: errorRows, fields: ['id', 'path', 'target'], filename: 'errors' });
      }
    }

    data.forEach(item => {
      shopify.redirect
        .update(item.id, item)
        .then(
          (redirect) => console.log(`${++count}/${total}`, '✅'),
          (err) => handleError(err, item)
        ).finally(() => {
          ++index;
          if (index == total) {
            logErrors();
          }
        });
    })

  })
}

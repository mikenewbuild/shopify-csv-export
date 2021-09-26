const fs = require('fs');
const { parse } = require('json2csv');
const { shopify } = require('./shopify.js');

const outputCsv = (rows, fields, filename = 'export.csv') => {
  const csv = parse(rows, { fields });
  fs.writeFile(filename, csv, (error) => {
    if (error) throw error;
  });
}

module.exports.write = async ({ shop }) => {
  let filename = 'prices.csv';
  let fields = ['handle', 'variants'];
  let params = { fields: fields, limit: 250 };

  console.log(`Fetching prices from ${shop}`);
  console.log();

  let rows = [];
  do {
    const products = await shopify['product'].list(params);
    const prices = products.flatMap(p => p.variants.map(v => {
      return {
        handle: p.handle,
        option1: v.option1,
        taxable: v.taxable,
        price: v.price,
        compare_at_price: v.compare_at_price
      };
    }));
    rows.push(...prices);

    console.log('Fetched......', rows.length);

    params = products.nextPageParameters;
  } while (params);

  let transforms = [
    {
      label: 'Handle',
      value: 'handle'
    },
    {
      label: 'Option1 Value',
      value: 'option1'
    },
    {
      label: 'Variant Price',
      value: (row) => addTax(row, 'price')
    },
    {
      label: 'Variant Compare At Price',
      value: (row) => addTax(row, 'compare_at_price')
    }
  ];

  outputCsv(rows, transforms, filename);

  console.log();
  console.log(`All done! Saved as "${filename}"`);
}

function addTax(row, field) {
  return row['taxable']
  ? (row[field] * 1.2).toFixed(2)
  : row[field];
}

require('dotenv').config();
const { shopify } = require('./shopify.js');
const { writeCsv } = require('./files.js');

const { SHOP } = process.env;

module.exports.write = async ({ name, priceMutation, usePartition }) => {
  name = name ? name.replace('.csv', '') : 'prices';
  let fields = ['handle', 'title', 'published_at', 'variants'];
  let params = { fields: fields, limit: 250 };

  console.log();
  console.log(`Fetching prices from ${SHOP}`);
  console.log();

  let rows = [];
  do {
    const products = await shopify['product'].list(params);
    const prices = products.flatMap(p => p.variants.map(v => {
      return {
        handle: p.handle,
        title: p.title,
        published_at: p.published_at,
        option1: v.option1,
        option2: v.option2,
        option3: v.option3,
        taxable: v.taxable,
        price: v.price,
        compare_at_price: v.compare_at_price
      };
    }));
    rows.push(...prices);

    console.log('Fetched......', rows.length);

    params = products.nextPageParameters;
  } while (params);

  let config = { rows, usePartition };

  console.log();
  console.log('Writing orginal prices...');
  writePricesCsv({ name: `${name}.original`, ...config });

  console.log();
  console.log('Writing mutated prices...');
  writePricesCsv({ name: `${name}.mutated`, priceMutation, ...config });

  console.log();
  console.log('** All done! **');
}

function writePricesCsv({ rows, name, priceMutation, usePartition }) {
  priceMutation = priceMutation ? priceMutation : (row, field) => row[field];

  let transforms = [
    {
      label: 'Handle',
      value: 'handle'
    },
    {
      label: 'Title',
      value: 'title'
    },
    {
      label: 'Option1 Value',
      value: 'option1'
    },
    {
      label: 'Option2 Value',
      value: 'option2'
    },
    {
      label: 'Option3 Value',
      value: 'option3'
    },
    {
      label: 'Variant Price',
      value: (row) => priceMutation(row, 'price')
    },
    {
      label: 'Variant Compare At Price',
      value: (row) => priceMutation(row, 'compare_at_price')
    }
  ];

  writePartitionedCsv({ rows, name, transforms }, usePartition);
}

function writePartitionedCsv({ rows, name, transforms }, { usePartition, passName, failName }) {
  passName = passName ? passName : 'pass';
  failName = failName ? failName : 'fail';
  [pass, fail] = partition(rows, usePartition);

  writeCsv({ rows: pass, fields: transforms, name: `${name}.${passName}` });
  writeCsv({ rows: fail, fields: transforms, name: `${name}.${failName}` });
}

function partition(array, isValid) {
  return array.reduce(([pass, fail], elem) => {
    return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
  }, [[], []]);
}

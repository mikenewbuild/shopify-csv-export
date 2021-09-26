require('dotenv').config();
const fs = require('fs');
const { parse } = require('json2csv');

const { SHOP } = process.env;

module.exports.writeCsv = ({ rows, fields, name, path }) => {
  path = `./storage/${SHOP}/`;
  name = name ? name.replace('.csv', '') : 'export';
  file = `${path}${name}.csv`;

  mkdir(path);
  write(file, parse(rows, { fields }));
}

function write(file, contents) {
  fs.writeFile(file, contents, (error) => {
    if (error) throw error;
    console.log(`Saved "${file}"`);
  });
}

function mkdir(path) {
  if (fs.existsSync(path)) return;

  fs.mkdir(path, (error) => {
    if (error) throw error;
    console.log(`Created  "${path}"`);
  });
}

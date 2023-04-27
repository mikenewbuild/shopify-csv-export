require('dotenv').config();
const fs = require('fs');
const { parse } = require('json2csv');

const { SHOP } = process.env;

module.exports.writeCsv = ({ rows, fields, filename, path }) => {
  path = `./storage/${SHOP}/`;
  filename = filename ? filename.replace('.csv', '') : 'export';
  file = `${path}${filename}.csv`;

  mkdir(path);
  write(file, parse(rows, { fields }));
}

module.exports.writeJson = ({ rows, filename, path }) => {
  path = `./storage/${SHOP}/`;
  filename = filename ? filename.replace('.json', '') : 'export';
  file = `${path}${filename}.json`;

  mkdir(path);
  write(file, JSON.stringify(rows));
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

const fetch = require('node-fetch');
const fs = require('fs');
const { parse } = require('json2csv');
require('dotenv').config();

const { API_KEY, PASSWORD, DOMAIN, RESOURCE, FIELDS } = process.env;
const baseUrl = `https://${API_KEY}:${PASSWORD}@${DOMAIN}`;

const resources = [];
const filename = `${RESOURCE}.csv`;

const outputCsv = (data, fields) => {
  const csv = parse(data, { fields });
  fs.writeFile(filename, csv, (err) => {
    if (err) throw err;
    console.log(`Done! saved as "${filename}"`);
  });
}

const parseNextUrl = (link) => {
  const next = link.split(',').find(i => i.includes('rel="next"'));
  if (!next) return '';
  const regex = new RegExp(/<(.+)>/g);
  return regex.exec(next)[1].replace(`https://${DOMAIN}`, baseUrl);
}

const getResources = async (url) => {
  const response = await fetch(url);
  const data = await response.json();
  if (!Array.isArray(data[RESOURCE])) {
    throw new Error('No data returned. Check that you have defined a plural resource.');
  }
  data[RESOURCE].forEach(row => resources.push(row));
  console.log("Fetched......", resources.length);

  const link = await response.headers.get('link') || '';
  const nextUrl = parseNextUrl(link);

  if (!nextUrl.startsWith('https')) {
    console.log("\nPreparing CSV...");
    outputCsv(resources, FIELDS.split(','));
    return;
  }

  getResources(nextUrl);
}

console.log(`Fetching ${RESOURCE} (${FIELDS}) from ${DOMAIN}\n`);

try {
  getResources(`${baseUrl}/admin/${RESOURCE}.json?limit=250&fields=${FIELDS}`);
} catch (error) {
  console.error(error);
}

require('dotenv').config()
const { parse } = require('json2csv')
const { mkdir, write } = require('./files')

const { SHOP } = process.env

module.exports.writeCsv = ({ rows, fields, name, path }) => {
  const filepath = path || `./storage/${SHOP}/`
  const filename = name ? name.replace('.csv', '') : 'export'
  const file = `${filepath}${filename}.csv`

  mkdir(filepath)
  write(file, parse(rows, { fields }))
}

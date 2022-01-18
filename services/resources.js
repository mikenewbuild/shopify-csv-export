require('dotenv').config()
const pluralize = require('pluralize')
const { shopify } = require('./shopify')
const { writeCsv } = require('./csv')

const { SHOP } = process.env

module.exports.write = async ({ fields, resource, relation }) => {
  const name = relation || resource
  const key = pluralize.singular(resource)
  const rows = []
  let params = { limit: 250 }
  if (relation) {
    params = { fields: [relation], ...params }
  } else {
    params = { fields, ...params }
  }

  console.log()
  console.log(`Fetching ${name} (${fields}) from ${SHOP}`)
  console.log()

  do {
    const resources = await shopify[key].list(params)
    if (relation) {
      rows.push(...resources.flatMap((r) => r[relation]))
    } else {
      rows.push(...resources)
    }

    console.log('Fetched......', rows.length)

    params = resources.nextPageParameters
  } while (params)

  writeCsv({ rows, fields, name })

  console.log()
  console.log('** All done! **')
}

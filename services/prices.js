require('dotenv').config()
const text = require('turbocolor')
const ProgressBar = require('progress')
const { shopify } = require('./shopify')
const { writeCsv } = require('./csv')
const { partition } = require('./utils')

const { SHOP } = process.env

function writePartitionedCsv(
  { rows, name, transforms },
  { usePartition, passName, failName }
) {
  const pass = passName || 'pass'
  const fail = failName || 'fail'
  const [passed, failed] = partition(rows, usePartition)

  writeCsv({ rows: passed, fields: transforms, name: `${name}.${pass}` })
  writeCsv({ rows: failed, fields: transforms, name: `${name}.${fail}` })
}

function writePricesCsv({ rows, name, priceMutation, usePartition }) {
  const mutate = priceMutation || ((row, field) => row[field])

  const transforms = [
    {
      label: 'Handle',
      value: 'handle',
    },
    {
      label: 'Title',
      value: 'title',
    },
    {
      label: 'Option1 Value',
      value: 'option1',
    },
    {
      label: 'Option2 Value',
      value: 'option2',
    },
    {
      label: 'Option3 Value',
      value: 'option3',
    },
    {
      label: 'Variant Price',
      value: (row) => mutate(row, 'price'),
    },
    {
      label: 'Variant Compare At Price',
      value: (row) => mutate(row, 'compare_at_price'),
    },
  ]

  writePartitionedCsv({ rows, name, transforms }, usePartition)
}

module.exports.write = async ({ name, priceMutation, usePartition }) => {
  const key = name ? name.replace('.csv', '') : 'prices'
  const fields = ['handle', 'title', 'published_at', 'variants']
  const limit = 49
  let params = { fields, limit }

  const rows = []

  const count = await shopify.product.count()
  const total = Math.ceil(count / limit)
  const label = `Fetching ${count} products from ${SHOP}`

  console.log(text.yellow(label))
  const bar = new ProgressBar(`[:bar] :percent :etas`, {
    total,
    label,
    width: 40,
  })

  do {
    const products = await shopify.product.list(params)
    const prices = products.flatMap((p) =>
      p.variants.map((v) => ({
        handle: p.handle,
        title: p.title,
        published_at: p.published_at,
        option1: v.option1,
        option2: v.option2,
        option3: v.option3,
        taxable: v.taxable,
        price: v.price,
        compare_at_price: v.compare_at_price,
      }))
    )
    rows.push(...prices)

    bar.tick()

    params = products.nextPageParameters
  } while (params)

  const config = { rows, usePartition }

  console.log(
    text.blue(
      'Found ' +
        text.bold(rows.length) +
        ' prices in ' +
        text.bold(count) +
        ' products.'
    )
  )
  console.log()
  console.log('Writing ' + text.bold('orginal') + ' prices...')
  writePricesCsv({ name: `${key}.original`, ...config })

  console.log('Writing ' + text.bold('mutated') + ' prices...')
  writePricesCsv({ name: `${key}.mutated`, priceMutation, ...config })

  console.log()
  console.log(text.green('** All done! **'))
}

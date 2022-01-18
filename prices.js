const TAX_MULTIPLIER = 1.2

function addTax(price) {
  return (price * TAX_MULTIPLIER).toFixed(2)
}

function calculateTax(row, field) {
  return row.taxable ? addTax(row[field]) : row[field]
}

function isPublished(row) {
  return row.published_at
}

const usePartition = {
  usePartition: isPublished,
  passName: 'published',
  failName: 'unpublished',
}

require('./services/prices')
  .write({ priceMutation: calculateTax, usePartition })
  .catch((error) => console.error(error))

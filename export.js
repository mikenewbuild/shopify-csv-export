const config = {
  resource: 'product',
  relation: 'variants',
  fields: ['id', 'title', 'sku', 'inventory_quantity', 'product_id', 'price'],
}

require('./services/resources')
  .write(config)
  .catch((error) => console.error(error))

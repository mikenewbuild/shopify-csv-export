let config = {
  resource: 'product',
  relation: 'variants',
  fields: ['id','title','sku','inventory_quantity','product_id','price']
}

require('./services/resources.js').write(config).catch(console.error());

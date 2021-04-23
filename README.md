# Shopify CSV Exports

### Setup

To set up copy the `env.example` file to `.env` and fill in the values. You'll need to add the private app credentials you created in Shopify, and make sure you have the privilege to read the resources you need.

```
cp .env.example .env
```

Install dependencies
```
npm install
```

### Usage

Kinda easy...
```
npm run export
```

### Config

Modify the `.env` file for the `RESOURCE`, `RELATION` (optional) and `FIELDS` (columns) you want.

Here's an example to grab some top level info about products.
```env
RESOURCE=products
RELATION=
FIELDS=id,handle,title,vendor,product_type,published_scope,tags
```

Here's an example to get details about variants.
```env
RESOURCE=products
RELATION=variants
FIELDS=id,title,sku,inventory_quantity,product_id,price
```

### To do

- [ ] Add tests

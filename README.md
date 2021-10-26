# Shopify CSV Exports

A simple starter script to quickly export configurable CSV files from Shopify stores.

### Setup

To set up copy the `env.example` file to `.env` and fill in the values. You'll need to add the private app credentials you created in Shopify, and make sure you have the privilege to read the resources you need.

```bash
$ cp .env.example .env
```

Install dependencies

```bash
$ npm install
```

### Usage

To export resources, modify `export-resources.js` to your needs then run:

```bash
$ npm run export
```

To export prices, modify `export-prices.js` to your needs then run:

```bash
$ npm run prices
```

### Resources

You can currently specify a resource and optionally a sub resource if you want to flatten the data.

### Prices

You can export a mutated set of prices along with the original price data (eg. with VAT added) and optionally partition it based on a boolean (eg. published).

### To do

- [ ] Add tests

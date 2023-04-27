require('dotenv').config();
const oldBlogId = process.env.OLD_BLOG_ID;
const newBlogId = process.env.NEW_BLOG_ID;

const dryRun = true;

let config = {
  parent_id: oldBlogId,
  resource: 'article',
  fields: [
    "title",
    "created_at",
    "body_html",
    "blog_id",
    "author",
    "published_at",
    "summary_html",
    "template_suffix",
    "handle",
    "tags",
    "image",
  ],
  mutation: (data) => {
    return data.map(row => {
      row.blog_id = newBlogId;
      return row;
    })
  },
  extension: 'json',
}

require('./services/resources.js').write(config).then(
  () => !dryRun && migrate()
).catch(console.error());

const fs = require('fs');
const Shopify = require('shopify-api-node');

function migrate() {

  const { SHOP, NEW_SHOP, NEW_PASSWORD, NEW_API_KEY } = process.env;

  fs.readFile(`./storage/${SHOP}/mutated.${oldBlogId}-articles.json`, 'utf8', (error, data) => {
    if (error) {
      console.error(error);
      return;
    }

    let shopify = new Shopify({
      apiKey: NEW_API_KEY,
      password: NEW_PASSWORD,
      shopName: NEW_SHOP,
      autoLimit: true
    });

    data = JSON.parse(data);

    data.reverse();

    let count = 0;
    let total = data.length;

    console.log();
    console.log(`** Adding ${total} articles... **`);
    console.log();

    data.forEach(item => {
      shopify.article
        .create(newBlogId, item)
        .then(
          (article) => console.log(`${++count}/${total}`, article.title),
          (err) => console.error(err)
        );
    })
  })
}

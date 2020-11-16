/* eslint-disable no-async-promise-executor */
const sha1 = require('sha1')

module.exports = (order, appConfig, storeId, appSdk, store) => {
  return new Promise(async (resolve) => {
    const transactions = []
    const produtos = {}
    const { buyers, items } = order

    const promises = items.map((item, index) => {
      return appSdk.apiRequest(storeId, `products/${item.product_id}.json`).then(({ response }) => {
        const product = response.data
        const image = product.pictures.find(picture => picture.normal && picture.normal.url)

        produtos[index] = {
          id_product: item.product_id,
          name_product: product.name,
          url_product: product.permalink || `${store.homepage}/${product.slug}`,
          url_image_product: image.normal.url,
          sku: product.sku
        }

        if (product.brands && Array.isArray(product.brands)) {
          produtos[index].brand_name = product.brands[0].name
        }

        if (product.gtin && Array.isArray(product.gtin)) {
          produtos[index].gtin_ean = product.gtin[0]
        }

        if (product.mpn && Array.isArray(product.mpn)) {
          produtos[index].mpn = product.mpn[0]
        }

        return produtos
      })
    })

    await Promise.all(promises).catch((err) => console.error('Api request err (products)', err))

    const createdAt = () => {
      const data = new Date(order.created_at)
      const year = data.getFullYear()
      const month = (`00${data.getMonth() + 1}`).slice(-2)
      const day = (`00${data.getDate()}`).slice(-2)
      return `${year}-${month}-${day}`
    }
  
    for (let i = 0; i < buyers.length; i++) {
      const buyer = buyers[i]
      const { name } = buyer

      const transaction = {
        order_ref: order.number,
        email: buyer.main_email,
        phone: buyer.phones[0].number,
        order_date: createdAt(),
        firstname: name.given_name || buyer.display_name,
        lastname: name.middle_name,
        channel: 'online',
        id_shop: storeId,
        query: 'pushCommandeSHA1',
        produtos
      }

      if (appConfig.delay) {
        transaction.delay = appConfig.delay
      }

      if (appConfig.delay_product) {
        transaction.delay_product = appConfig.delay_product
      }

      let sign = ''
      ;[
        'query', 
        'order_ref',
        'email',
        'lastname',
        'firstname',
        'order_date',
        'delay'
      ].forEach(key => {
        if (transaction[key]) {
          sign += transaction[key]
        }
      })
      sign += appConfig.secret_key
      transaction.sign = sha1(sign)
      transactions.push(transaction)
    }

    resolve({
      transactions,
      order,
      appConfig,
      storeId,
      appSdk
    })
  })
}
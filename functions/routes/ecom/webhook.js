/* eslint-disable promise/no-nesting */
const axios = require('axios')
const qs = require('querystring')

// read configured E-Com Plus app data
const getAppData = require('./../../lib/store-api/get-app-data')
const getBaseUrl = require('./../../lib/integration/get-base-url')
const newTransaction = require('./../../lib/integration/new-transaction')

const SKIP_TRIGGER_NAME = 'SkipTrigger'
const ECHO_SUCCESS = 'SUCCESS'
const ECHO_SKIP = 'SKIP'
const ECHO_API_ERROR = 'STORE_API_ERR'

exports.post = async ({ appSdk, admin }, req, res) => {
  // receiving notification from Store API
  const { storeId } = req
  // firebase db collection
  const fbCollection = admin.firestore().collection('ov_orders')

  /**
   * Treat E-Com Plus trigger body here
   * Ref.: https://developers.e-com.plus/docs/api/#/store/triggers/
   */
  const trigger = req.body
  const resourceId = trigger.resource_id
  if (!resourceId) {
    return res.send(ECHO_SKIP)
  }

  // check if exist in collection
  await fbCollection.doc(resourceId).get().then((doc) => {
    if (!doc.exists) {
      // get app configured options
      return getAppData({ appSdk, storeId }).then((configObj) => {
        return appSdk.apiRequest(storeId, `orders/${resourceId}.json`).then(({ response }) => ({ response, configObj }))
      }).then(({ response, configObj }) => {
        const { data } = response
        const sendOrderPaid = configObj.send_order_paid && 
          data.financial_status && 
          data.financial_status.current === 'paid'

        if (sendOrderPaid || 
            (data.fulfillment_status && data.fulfillment_status.current === 'delivered')
        ) {
          return sendReviews(storeId, appSdk, data, configObj)
        } else {
          // skip if not delivered or paid
          return res.send(ECHO_SKIP)
        }
      }).then((result) => {
        console.log('Pedidos enviados com sucesso', {
          result,
          storeId,
          resourceId
        })

        fbCollection.doc(resourceId).set({
          success: true,
          storeId
        })

        return res.send(ECHO_SUCCESS)
      }).catch(err => {
        console.error(err)
        if (err.name === SKIP_TRIGGER_NAME) {
          // trigger ignored by app configuration
          return res.send(ECHO_SKIP)
        } else {
          // console.error(err)
          // request to Store API with error response
          // return error status code
          console.error('Envio do pedido falou', {
            err,
            storeId,
            resourceId
          })

          res.status(500)
          const { message } = err
          return res.send({
            error: ECHO_API_ERROR,
            message
          })
        }
      })
    }

    return res.send(ECHO_SKIP)
  })
}

const sendReviews = (storeId, appSdk, order, configObj) => {
  return appSdk.apiRequest(storeId, 'stores/me.json').then(({ response }) => {
    const store = response.data
    return newTransaction(order, configObj, storeId, appSdk, store)
  }).then(({ transactions }) => {
    const promises = transactions.map(transaction => {
      const data = {
        idWebsite: configObj.id_website,
        message: JSON.stringify(transaction)
      }

      return axios({
        baseURL: getBaseUrl(configObj.account_country),
        url: '/index.php?' +
          'action=act_api_notification_sha1&' +
          'type=json2',
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify(data)
      }).then(({ data }) => {
        if (parseInt(data.return, 10) !== 1) {
          const err = new Error(`[#${storeId}] Envio do pedido ${order.number} falhou.`)
          err.name = 'bodyErr'
          err.response = data.debug
          throw err
        }

        return {
          storeId,
          order: order.number
        }
      })
    })

    return Promise.all(promises)
  })
}
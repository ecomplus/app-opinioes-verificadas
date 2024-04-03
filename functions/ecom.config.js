/* eslint-disable comma-dangle, no-multi-spaces, key-spacing */

/**
 * Edit base E-Com Plus Application object here.
 * Ref.: https://developers.e-com.plus/docs/api/#/store/applications/
 */

const app = {
  app_id: 125183,
  title: 'Opiniões Verificadas',
  slug: 'opinioes-verificadas',
  type: 'external',
  state: 'active',
  authentication: true,

  /**
   * Uncomment modules above to work with E-Com Plus Mods API on Storefront.
   * Ref.: https://developers.e-com.plus/modules-api/
   */
  modules: {
    /**
     * Triggered to calculate shipping options, must return values and deadlines.
     * Start editing `routes/ecom/modules/calculate-shipping.js`
     */
    // calculate_shipping:   { enabled: true },

    /**
     * Triggered to validate and apply discount value, must return discount and conditions.
     * Start editing `routes/ecom/modules/apply-discount.js`
     */
    // apply_discount:       { enabled: true },

    /**
     * Triggered when listing payments, must return available payment methods.
     * Start editing `routes/ecom/modules/list-payments.js`
     */
    // list_payments:        { enabled: true },

    /**
     * Triggered when order is being closed, must create payment transaction and return info.
     * Start editing `routes/ecom/modules/create-transaction.js`
     */
    // create_transaction:   { enabled: true },
  },

  /**
   * Uncomment only the resources/methods your app may need to consume through Store API.
   */
  auth_scope: {
    'stores/me': [
      'GET'            // Read store info
    ],
    procedures: [
      'POST'           // Create procedures to receive webhooks
    ],
    products: [
      'GET',           // Read products with public and private fields
      // 'POST',          // Create products
      // 'PATCH',         // Edit products
      // 'PUT',           // Overwrite products
      // 'DELETE',        // Delete products
    ],
    orders: [
      'GET',           // List/read orders with public and private fields
      // 'POST',          // Create orders
      // 'PATCH',         // Edit orders
      // 'PUT',           // Overwrite orders
      // 'DELETE',        // Delete orders
    ]

    /**
     * You can also set any other valid resource/subresource combination.
     * Ref.: https://developers.e-com.plus/docs/api/#/store/
     */
  },

  admin_settings: {
    id_website: {
      schema: {
        type: 'string',
        maxLength: 255,
        title: 'ID Website',
        description: 'Site de login. pode ser encontrado aqui https://www.opinioes-verificadas.com.br/index.php?page=mod_param_contact'
      },
      hide: true
    },
    secret_key: {
      schema: {
        type: 'string',
        maxLength: 255,
        title: 'Chave Secreta',
        description: 'Chave secreta para identificação no envio dos pedidos para a plataforma. pode ser encontrado aqui https://www.opinioes-verificadas.com.br/index.php?page=mod_param_contact'
      },
      hide: true
    },
    account_country: {
      schema: {
        type: 'string',
        enum: ['FR','ES','DE','IT','NL','UK','US','BR','PT','CO','PL','MX'],
        title: 'País da Conta',
        description: 'Escolha a opções correta ou o envio dos pedidos pode não funcionar corretamente.',
      },
      hide: true
    },
    send_order_paid: {
      schema: {
        type: 'boolean',
        default: false,
        title: 'Enviar pedido para Opiniões Verificadas após aprovação do pedido',
        description: 'Caso ativado, o pedido será enviado assim que aprovado e não mais ao mudar status para entregue',
      },
      hide: true
    }
  }
}

/**
 * List of Procedures to be created on each store after app installation.
 * Ref.: https://developers.e-com.plus/docs/api/#/store/procedures/
 */

const procedures = []

const { baseUri } = require('./__env')

procedures.push({
  title: app.title,

  triggers: [
    {
      resource: 'orders',
      field: 'fulfillment_status',
    },
    {
      resource: 'orders',
      field: 'financial_status',
    }
  ],

  webhooks: [
    {
      api: {
        external_api: {
          uri: `${baseUri}/ecom/webhook`
        }
      },
      method: 'POST'
    }
  ]
})

exports.app = app

exports.procedures = procedures

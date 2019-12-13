'use strict'

module.exports = appSdk => {
  return (req, res) => {
    // body was already pre-validated on @/bin/web.js
    // treat module request body
    const { params, application } = req.body
    // app configured options
    const config = Object.assign({}, application.data, application.hidden_data)

    // start mounting response body
    // https://apx-mods.e-com.plus/api/v1/calculate_shipping/response_schema.json?store_id=100
    const response = {
      shipping_services: []
    }
    let shippingRules
    if (Array.isArray(config.shipping_rules) && config.shipping_rules.length) {
      shippingRules = config.shipping_rules
    } else {
      // anything to do without shipping rules
      res.send(response)
      return
    }

    // search for configured free shipping rule
    for (let i = 0; i < shippingRules.length; i++) {
      const rule = shippingRules[i]
      if (rule.total_price === 0) {
        if (!rule.min_amount) {
          response.free_shipping_from_value = 0
          break
        } else if (!(response.free_shipping_from_value <= rule.min_amount)) {
          response.free_shipping_from_value = rule.min_amount
        }
      }
    }

    // params object follows calculate shipping request schema:
    // https://apx-mods.e-com.plus/api/v1/calculate_shipping/schema.json?store_id=100
    if (!params.to) {
      // respond only with free shipping option
      res.send(response)
      return
    }

    const destinationZip = params.to.zip.replace(/\D/g, '')
    let originZip
    if (!params.from) {
      if (!config.zip) {
        // must have configured origin zip code to continue
        return res.status(400).send({
          error: 'CALCULATE_ERR',
          message: 'Zip code is unset on app hidden data (merchant must configure the app)'
        })
      }
      originZip = config.zip.replace(/\D/g, '')
    } else {
      originZip = params.from.zip.replace(/\D/g, '')
    }

    // calculate weight and pkg value from items list
    let amount = params.subtotal || 0
    if (params.items) {
      const sumDimensions = {}
      let finalWeight = 0
      params.items.forEach(({ price, quantity, dimensions, weight }) => {
        if (!params.subtotal) {
          amount += price * quantity
        }

        // sum physical weight
        if (weight && weight.value) {
          switch (weight.unit) {
            case 'kg':
              finalWeight += weight.value
              break
            case 'g':
              finalWeight += weight.value / 1000
              break
            case 'mg':
              finalWeight += weight.value / 1000000
          }
        }

        // sum total items dimensions to calculate cubic weight
        if (dimensions) {
          for (const side in dimensions) {
            const dimension = dimensions[side]
            if (dimension && dimension.value) {
              let dimensionValue
              switch (dimension.unit) {
                case 'cm':
                  dimensionValue = dimension.value
                  break
                case 'm':
                  dimensionValue = dimension.value * 100
                  break
                case 'mm':
                  dimensionValue = dimension.value / 10
              }
              // add/sum current side to final dimensions object
              if (dimensionValue) {
                sumDimensions[side] = sumDimensions[side]
                  ? sumDimensions[side] * dimensionValue
                  : dimensionValue
              }
            }
          }
        }
      })

      // calculate cubic weight
      // https://suporte.boxloja.pro/article/82-correios-calculo-frete
      // (C x L x A) / 6.000
      let cubicWeight = 1
      for (const side in sumDimensions) {
        if (sumDimensions[side]) {
          cubicWeight *= sumDimensions[side]
        }
      }
      if (cubicWeight > 1) {
        cubicWeight /= 6000
        if (cubicWeight > finalWeight) {
          // use cubic instead of phisic weight
          finalWeight = cubicWeight
        }
      }

      // start filtering shipping rules
      const validShippingRules = shippingRules.filter(rule => Boolean(
        rule &&
        (!params.service_code || params.service_code === rule.service_code) &&
        (!rule.zip_range ||
          (rule.zip_range.min <= destinationZip && rule.zip_range.max >= destinationZip)) &&
        !(rule.min_amount > amount) &&
        !(finalWeight > rule.max_cubic_weight)
      ))

      if (validShippingRules.length) {
        // group by service code selecting lower price
        const shippingRulesByCode = validShippingRules.reduce((shippingRulesByCode, rule) => {
          const serviceCode = rule.service_code
          const currentShippingRule = shippingRulesByCode[serviceCode]
          if (!currentShippingRule || currentShippingRule.total_price > rule.total_price) {
            shippingRulesByCode[serviceCode] = rule
          }
          return shippingRulesByCode
        }, {})

        // parse final shipping rules object to shipping services array
        for (const serviceCode in shippingRulesByCode) {
          const rule = shippingRulesByCode[serviceCode]
          if (rule) {
            // delete filter properties from rule object
            delete rule.service_code
            delete rule.zip_range
            delete rule.min_amount
            delete rule.max_cubic_weight
            // also try to find corresponding service object from config
            let service
            if (Array.isArray(config.services)) {
              service = config.services.find(service => service.service_code === serviceCode)
            }

            response.shipping_services.push({
              label: serviceCode,
              // label, service_code, carrier (and maybe more) from service object
              ...service,
              shipping_line: {
                from: {
                  ...params.from,
                  zip: originZip
                },
                to: params.to,
                // total_price, delivery_time (and maybe more) from rule object
                ...rule
              }
            })
          }
        }
      }
    }

    // expecting to have response with shipping services here
    res.send(response)
  }
}

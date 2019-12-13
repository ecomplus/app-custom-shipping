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
    // search for configured free shipping rule
    if (Array.isArray(config.shipping_rules)) {
      for (let i = 0; i < config.shipping_rules.length; i++) {
        const rule = config.shipping_rules[i]
        if (rule.free_shipping) {
          if (!rule.min_amount) {
            response.free_shipping_from_value = 0
            break
          } else if (!(response.free_shipping_from_value <= rule.min_amount)) {
            response.free_shipping_from_value = rule.min_amount
          }
        }
      }
    }

    // params object follows calculate shipping request schema:
    // https://apx-mods.e-com.plus/api/v1/calculate_shipping/schema.json?store_id=100
    if (!params.to) {
      // respond only with free shipping option
      res.send(response)
    } else {
      sCepDestino = params.to.zip
    }
    if (!params.from) {
      if (!config.zip) {
        // must have configured origin zip code to continue
        return res.status(400).send({
          error: 'CALCULATE_ERR',
          message: 'Zip code is unset on app hidden data (merchant must configure the app)'
        })
      }
      sCepOrigem = config.zip.replace(/\D/g, '')
    } else {
      sCepOrigem = params.from.zip.replace(/\D/g, '')
    }

    // optinal predefined or configured service codes
    if (params.service_code) {
      nCdServico = params.service_code
    } else if (Array.isArray(config.services) && config.services[0]) {
      nCdServico = config.services[0].service_code
      for (let i = 1; i < config.services.length; i++) {
        nCdServico += `,${config.services[i].service}`
      }
    }

    // optional params to Correios services
    if (params.subtotal) {
      nVlValorDeclarado = params.subtotal
    }
    if (params.own_hand) {
      sCdMaoPropria = 's'
    }
    if (params.receipt) {
      sCdAvisoRecebimento = 's'
    }

    // calculate weight and pkg value from items list
    if (params.items) {
      const sumDimensions = {}
      params.items.forEach(({ price, quantity, dimensions, weight }) => {
        if (!params.subtotal) {
          nVlValorDeclarado += price * quantity
        }

        // sum physical weight
        if (weight && weight.value) {
          switch (weight.unit) {
            case 'kg':
              nVlPeso += weight.value
              break
            case 'g':
              nVlPeso += weight.value / 1000
              break
            case 'mg':
              nVlPeso += weight.value / 1000000
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
        if (cubicWeight > nVlPeso) {
          // use cubic instead of phisic weight
          nVlPeso = cubicWeight
        }
      }

      // send requests to both Correios offline and WS
      const firstCalculateResult = new Promise(resolve => {
        let countErrors = 0
        let errorMsg
        const handleErrors = err => {
          countErrors++
          errorMsg += `- ${err.message}`
          if (countErrors === 2) {
            // both WS and offline failed
            return res.status(400).send({
              error: 'CALCULATE_FAILED',
              message: errorMsg
            })
          }
        }

        // handle delay to send Correios offline request
        // prefer Correios WS
        let correiosOfflineTimer
        correiosCalculate({
          sCepOrigem,
          sCepDestino,
          nCdEmpresa,
          sDsSenha,
          nCdServico,
          sCdMaoPropria,
          sCdAvisoRecebimento,
          nVlPeso,
          nVlValorDeclarado
        })
          .then(result => {
            clearTimeout(correiosOfflineTimer)
            resolve(result)
          })
          .catch(handleErrors)

        if (!config.disable_correios_offline) {
          const offlineListParams = {
            sCepOrigem: nCdEmpresa ? sCepOrigem : findBaseZipCode(sCepOrigem),
            sCepDestino: findBaseZipCode(sCepDestino),
            nCdEmpresa,
            // optinal predefined service code
            Codigo: params.service_code
          }

          if (offlineListParams.sCepOrigem && offlineListParams.sCepDestino) {
            // start timer to send Correios offline request
            const correiosOfflineDelay = config.correios_offline_delay || 3000
            correiosOfflineTimer = setTimeout(() => {
              correiosOfflineClient.list(offlineListParams)

                .then(results => {
                  // filter results firts
                  const validResults = results.filter(result => {
                    if (nCdServico) {
                      // check results service code
                      const availableServiceCodes = nCdServico.split(',')
                      if (availableServiceCodes.indexOf(result.Codigo) === -1) {
                        // service not available
                        return false
                      }
                    }
                    // also removes results with low weight
                    return result.nVlPeso >= nVlPeso
                  })

                  if (validResults.length) {
                    // resolve with best result per service code only
                    const cServico = validResults.reduce((bestResults, result) => {
                      const index = bestResults.findIndex(({ Codigo }) => Codigo === result.Codigo)
                      if (index > -1) {
                        // keep lowest weight
                        if (bestResults[index].nVlPeso > result.nVlPeso) {
                          // overwrite result object
                          bestResults[index] = result
                        }
                      } else {
                        // any result for current service code yet
                        // add new result object
                        bestResults.push(result)
                      }
                      return bestResults
                    }, [])
                    resolve({ cServico, fromOffline: true })
                  } else {
                    handleErrors(new Error('Results from offline data invalidated'))
                  }
                })

                .catch(handleErrors)
            }, correiosOfflineDelay)
          }
        }
      })

      firstCalculateResult.then(({ Servicos, cServico, fromOffline }) => {
        // set services array from `Servicos` or `cServico`
        let services
        if (Servicos) {
          if (Array.isArray(Servicos)) {
            services = Servicos
          } else if (Servicos.cServico) {
            services = Array.isArray(Servicos.cServico) ? Servicos.cServico : [Servicos.cServico]
          }
        }
        if (!services) {
          services = Array.isArray(cServico) ? cServico : [cServico]
        }

        if (services[0] && services[0].Codigo) {
          let errorMsg
          services.forEach(service => {
            // check error first
            const { Erro, MsgErro } = service

            if (!Erro || Erro === '0') {
              // fix price strings to number
              ;[
                'Valor',
                'ValorSemAdicionais',
                'ValorMaoPropria',
                'ValorAvisoRecebimento',
                'ValorValorDeclarado'
              ].forEach(field => {
                switch (typeof service[field]) {
                  case 'number':
                    break
                  case 'string':
                    service[field] = parseFloat(service[field].replace(',', '.'))
                    break
                  default:
                    service[field] = 0
                }
              })
              let {
                Codigo,
                Valor,
                ValorSemAdicionais,
                ValorMaoPropria,
                ValorAvisoRecebimento,
                ValorValorDeclarado,
                PrazoEntrega
              } = service

              if (fromOffline) {
                if (config.correios_offline_value_margin) {
                  // percentual addition/discount for Correios offline results
                  Valor *= (1 + config.correios_offline_value_margin / 100)
                }
                ValorSemAdicionais = Valor
                // sum additional services to total value
                if (nVlValorDeclarado) {
                  // https://github.com/ecomclub/app-correios#about-correios-offline
                  ValorValorDeclarado = (nVlValorDeclarado - 19.5) * 0.02
                  Valor += ValorValorDeclarado
                }
                if (sCdMaoPropria) {
                  ValorMaoPropria = config.own_hand_price || 7
                  Valor += ValorMaoPropria
                }
                if (sCdAvisoRecebimento) {
                  ValorAvisoRecebimento = config.receipt_price || 6
                  Valor += ValorAvisoRecebimento
                }
              }

              // find respective configured service label
              let serviceName
              switch (Codigo) {
                case '04014':
                  serviceName = 'SEDEX'
                  break
                case '04510':
                  serviceName = 'PAC'
              }
              let label = serviceName || `Correios ${Codigo}`
              if (Array.isArray(config.services)) {
                for (let i = 0; i < config.services.length; i++) {
                  const service = config.services[i]
                  if (service && service.service_code === Codigo && service.label) {
                    label = service.label
                  }
                }
              }

              // parse to E-Com Plus shipping line object
              const shippingLine = {
                from: {
                  ...params.from,
                  zip: sCepOrigem
                },
                to: params.to,
                price: ValorSemAdicionais || Valor,
                declared_value: nVlValorDeclarado,
                declared_value_price: ValorValorDeclarado || 0,
                own_hand: Boolean(sCdMaoPropria),
                own_hand_price: ValorMaoPropria,
                receipt: Boolean(sCdAvisoRecebimento),
                receipt_price: ValorAvisoRecebimento,
                discount: 0,
                total_price: Valor,
                delivery_time: {
                  days: parseInt(PrazoEntrega, 10),
                  working_days: true
                },
                posting_deadline: {
                  days: 3,
                  ...config.posting_deadline
                },
                flags: [fromOffline ? 'correios-offline' : 'correios-ws']
              }

              // check for default configured additional/discount price
              if (config.additional_price) {
                if (config.additional_price > 0) {
                  shippingLine.other_additionals = [{
                    tag: 'additional_price',
                    label: 'Adicional padrão',
                    price: config.additional_price
                  }]
                } else {
                  // negative additional price to apply discount
                  shippingLine.discount -= config.additional_price
                }
                // update total price
                shippingLine.total_price += config.additional_price
              }

              // search for discount by shipping rule
              if (Array.isArray(config.shipping_rules)) {
                for (let i = 0; i < config.shipping_rules.length; i++) {
                  const rule = config.shipping_rules[i]
                  if (
                    rule &&
                    (!rule.service_code || rule.service_code === Codigo) &&
                    (!rule.zip_range ||
                      (rule.zip_range.min <= sCepDestino && rule.zip_range.max >= sCepDestino)) &&
                    !(rule.min_amount > nVlValorDeclarado)
                  ) {
                    // valid shipping rule
                    if (rule.free_shipping) {
                      shippingLine.discount += shippingLine.total_price
                      shippingLine.total_price = 0
                      break
                    } else if (rule.discount) {
                      let discountValue = rule.discount.value
                      if (rule.discount.percentage) {
                        discountValue *= (shippingLine.total_price / 100)
                      }
                      shippingLine.discount += discountValue
                      shippingLine.total_price -= discountValue
                      if (shippingLine.total_price < 0) {
                        shippingLine.total_price = 0
                      }
                      break
                    }
                  }
                }
              }

              // push shipping service object to response
              response.shipping_services.push({
                label,
                carrier: 'Correios',
                // https://informederendimentos.com/consulta/cnpj-correios/
                carrier_doc_number: '34028316000103',
                service_code: Codigo,
                service_name: serviceName || label,
                shipping_line: shippingLine
              })
            } else {
              errorMsg = `Correios erro ${Erro}`
              if (typeof MsgErro === 'string') {
                errorMsg += `: ${MsgErro}`
              }
            }
          })

          return !response.shipping_services.length && errorMsg
            // pass Correios error message
            ? res.status(400).send({
              error: 'CALCULATE_ERR_MSG',
              message: errorMsg
            })
            // success response with available shipping services
            : res.send(response)
        }

        // unexpected result object
        res.status(500).send({
          error: 'CALCULATE_UNEXPECTED_RSP',
          message: 'Unexpected object from Correios response, please try again later'
        })
      })
    }
  }
}

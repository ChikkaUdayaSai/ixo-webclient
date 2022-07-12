import Axios from 'axios'
import {
  BondActions,
  GetBalancesAction,
  GetTradesAction,
  ClearBondAction,
  GetTransactionsAction,
  GetOutcomesTargetsAction,
  GetPriceHistoryAction,
  GetAlphaHistoryAction,
  GetWithdrawHistoryAction,
  GetBondDidAction,
} from './types'
import { Dispatch } from 'redux'
import { get } from 'lodash'
import {
  formatCurrency,
  minimalDenomToDenom,
} from '../../Account/Account.utils'
import { RootState } from 'common/redux/types'
import blocksyncApi from 'common/api/blocksync-api/blocksync-api'
import { getBalanceNumber } from 'common/utils/currency.utils'
import { BigNumber } from 'bignumber.js'
import moment from 'moment'

// TODO: alpha endpoint here must be switched
// const NEW_BLOCKSYNC_API = 'http://136.244.115.236:8080'
const NEW_BLOCKSYNC_API = 'https://blocksync-pandora.ixo.earth'

export const getBondDid = (bondDid: string): GetBondDidAction => {
  return {
    type: BondActions.GetBondDid,
    payload: bondDid,
  }
}

export const clearBond = (): ClearBondAction => ({
  type: BondActions.ClearBond,
})

export const getBalances =
  (bondDid: string) =>
  (dispatch: Dispatch): GetBalancesAction => {
    if (!bondDid) {
      return undefined
    }
    // dispatch(clearBond())
    const bondRequest = Axios.get(
      `${process.env.REACT_APP_GAIA_URL}/bonds/${bondDid}`,
      {
        transformResponse: [
          (response: string): any => {
            const parsedResponse = JSON.parse(response)
            return get(parsedResponse, 'result.value', parsedResponse)
          },
        ],
      },
    )
    const priceRequest = Axios.get(
      `${process.env.REACT_APP_GAIA_URL}/bonds/${bondDid}/current_price`,
      {
        transformResponse: [
          (response: string): any => {
            const parsedResponse = JSON.parse(response)
            return get(parsedResponse, 'result', ['error'])[0]
          },
        ],
      },
    ).catch(() => undefined)
    // const reserveRequest = Axios.get(
    //   `${process.env.REACT_APP_GAIA_URL}/bonds/${bondDid}/current_reserve`,
    //   {
    //     transformResponse: [
    //       (response: string): any => {
    //         const parsedResponse = JSON.parse(response)
    //         return get(parsedResponse, 'result', ['error'])[0]
    //       },
    //     ],
    //   },
    // )

    return dispatch({
      type: BondActions.GetBalances,
      payload: Promise.all([bondRequest, priceRequest]).then(
        Axios.spread((...responses) => {
          const bond = responses[0].data
          let price = 0
          if (responses[1] && responses[1].data) {
            price = responses[1].data
          }

          // const reserve = responses[2].data

          const { function_parameters } = bond

          const initialRaised = function_parameters.find(
            ({ param }) => param === 'd0',
          )

          const publicAlpha = Number(
            bond.function_parameters.find(
              (param) => param.param === 'publicAlpha',
            )?.value ?? 0,
          )

          const systemAlpha = Number(
            bond.function_parameters.find(
              (param) => param.param === 'systemAlpha',
            )?.value ?? 0,
          )

          return {
            bondDid,
            symbol: bond.token,
            reserveDenom: bond.reserve_tokens[0],
            name: bond.name,
            address: bond.feeAddress,
            type: bond.function_type,
            myStake: formatCurrency(bond.current_supply),
            capital: formatCurrency(bond.current_reserve[0]),
            maxSupply: formatCurrency(bond.max_supply),
            initialRaised: initialRaised
              ? minimalDenomToDenom(bond.reserve_tokens[0], initialRaised.value)
              : 0,
            price: formatCurrency(price),
            reserve: formatCurrency(bond.available_reserve[0]),
            outcomePayment: Number(bond.outcome_payment),
            systemAlpha,
            publicAlpha,
            alphaDate: new Date(),
            state: bond.state,
            initialSupply: Number(
              bond.function_parameters.find((param) => param.param === 'S0')
                ?.value,
            ),
            initialPrice: Number(
              bond.function_parameters.find((param) => param.param === 'p0')
                ?.value ?? 0,
            ),
            allowSells: bond.allow_sells ?? false,
            allowReserveWithdrawals: bond.allow_reserve_withdrawals,
            availableReserve: bond.available_reserve,
            controllerDid: bond.controller_did,
          }
        }),
      ),
    })
  }

export const getTransactions =
  () =>
  (dispatch: Dispatch): GetTradesAction => {
    // TODO: Select Specific token
    // TODO: Are queries disappearing?

    const config = {
      transformResponse: [
        (response: string): any => {
          return JSON.parse(response).txs
        },
      ],
    }

    const buyReq = Axios.get(
      process.env.REACT_APP_GAIA_URL + '/txs?message.action=buy',
      config,
    )
    const sellReq = Axios.get(
      process.env.REACT_APP_GAIA_URL + '/txs?message.action=sell',
      config,
    )
    const swapReq = Axios.get(
      process.env.REACT_APP_GAIA_URL + '/txs?message.action=swap',
      config,
    )

    return dispatch({
      type: BondActions.GetTrades,
      payload: Promise.all([buyReq, sellReq, swapReq]).then(
        Axios.spread((...responses) => {
          const buy = responses[0].data
          const sell = responses[1].data
          const swap = responses[2].data
          return { trades: [...buy, ...sell, ...swap] }
        }),
      ),
    })
  }

export const getTransactionsByBondDID =
  (bondDid: string) =>
  (dispatch: Dispatch, getState: () => RootState): GetTransactionsAction => {
    const { account } = getState()
    let userDid = undefined

    try {
      const { userInfo } = account
      const { didDoc } = userInfo
      const { did } = didDoc
      userDid = did.slice(8)
    } catch (e) {
      userDid = undefined
    }

    const transactionReq = Axios.get(
      `${process.env.REACT_APP_BLOCK_SYNC_URL}/transactions/listTransactionsByBondDid/${bondDid}`,
    )

    const priceReq = Axios.get(
      `${process.env.REACT_APP_BLOCK_SYNC_URL}/api/bonds/getPriceHistoryByBondDid/${bondDid}`,
    )

    return dispatch({
      type: BondActions.GetTransactions,
      payload: Promise.all([transactionReq, priceReq]).then(
        Axios.spread((...responses) => {
          const transactions = responses[0].data
          let priceHistory = []
          if (responses[1].data) {
            priceHistory = responses[1].data.priceHistory
          }

          return transactions.map((data) => {
            let transaction = data.tx_response
            const status = transaction.logs.length ? 'succeed' : 'failed'
            const events = transaction.logs[0]?.events
            const quantity = transaction.tx?.body?.messages[0]?.amount
              ? formatCurrency(transaction.tx?.body?.messages[0]?.amount).amount
              : 0
            const buySell =
              transaction.tx?.body?.messages[0]['@type'].includes('MsgBuy')
            let isMyTX = false
            // TODO: temporary hack for ubs demo on May, 2022
            if (buySell) {
              isMyTX =
                transaction.tx?.body?.messages[0]['buyer_did'].includes(userDid)
            }
            const price =
              priceHistory.find(
                (his) => {
                  return (
                    Math.abs(moment(his.time).diff(transaction.timestamp)) <
                    1000
                  )
                },
                // moment(his.time).diff(transaction.timestamp) < 1,
              )?.price ??
              priceHistory
                .filter((his) => transaction.timestamp > his.time)
                .pop()?.price ??
              0

            transaction = {
              ...transaction,
              price: price,
            }

            let transfer_amount = 0
            if (events) {
              const transfer_event = events.find(
                (eve) => eve.type === 'transfer',
              )
              if (transfer_event) {
                transfer_amount = getBalanceNumber(
                  new BigNumber(
                    parseInt(
                      transfer_event.attributes.find(
                        (attr) => attr.key === 'amount',
                      ).value,
                    ),
                  ),
                )
              }
            }

            return {
              ...transaction,
              status: status,
              quantity: quantity,
              buySell: buySell,
              price: price,
              value: (transfer_amount / quantity).toFixed(2),
              amount: transfer_amount,
              isMyStake: isMyTX,
            }
          })
        }),
      ),
    })
  }

export const getOutcomesTargets =
  () =>
  (dispatch: Dispatch, getState: () => RootState): GetOutcomesTargetsAction => {
    const {
      selectedEntity: {
        entityClaims: { items },
      },
    } = getState()

    const requests = items.map((item) =>
      blocksyncApi.project.getProjectByProjectDid(item['@id']),
    )

    return dispatch({
      type: BondActions.GetOutcomesTargets,
      payload: Promise.all(requests).then(
        Axios.spread((...responses) => {
          return responses.map((response: any, index) => {
            return {
              ...items[index],
              ddoTags: response.data.ddoTags,
            }
          })
        }),
      ),
    })
  }

export const getPriceHistory =
  (bondDid) =>
  (dispatch: Dispatch): GetPriceHistoryAction => {
    return dispatch({
      type: BondActions.GetPriceHistory,
      payload: Axios.get(
        `${process.env.REACT_APP_BLOCK_SYNC_URL}/api/bonds/getPriceHistoryByBondDid/${bondDid}`,
      )
        .then((res) => res.data)
        .then((res) => res.priceHistory)
        .then((res) =>
          res
            .map((history) => ({
              price: Number(history.price),
              time: history.time,
            }))
            .sort((a, b): number => {
              if (moment(a.time).valueOf() > moment(b.time).valueOf()) {
                return 1
              }
              return -1
            }),
        )
        .catch(() => []),
    })
  }

export const getAlphaHistory =
  (bondDid) =>
  (dispatch: Dispatch): GetAlphaHistoryAction => {
    return dispatch({
      type: BondActions.GetAlphaHistory,
      // TODO: NEW_BLOCKSYNC_API, bondDid should be switched
      // payload: Axios.get(
      //   `${NEW_BLOCKSYNC_API}/api/bond/get/alphas/${'did:ixo:U7GK8p8rVhJMKhBVRCJJ8c'}`,
      // )
      payload: Axios.get(`${NEW_BLOCKSYNC_API}/api/bond/get/alphas/${bondDid}`)
        .then((res) => res.data)
        .then((res) =>
          res.map((history) => ({
            alpha: Number(JSON.parse(history.raw_value).value.alpha),
            editorDid: JSON.parse(history.raw_value).value.editor_did,
            time: history.timestamp,
          })),
        )
        .catch(() => []),
    })
  }

export const getWithdrawHistory =
  (bondDid) =>
  (dispatch: Dispatch): GetWithdrawHistoryAction => {
    const withdrawReserveReq = Axios.get(
      `${NEW_BLOCKSYNC_API}/api/bond/get/withdraw/reserve/bybonddid/${bondDid}`,
    )

    const withdrawShareReq = Axios.get(
      `${NEW_BLOCKSYNC_API}/api/bond/get/withdraw/share/bybondid/${bondDid}`,
    )

    return dispatch({
      type: BondActions.GetWithdrawHistory,
      payload: Promise.all([withdrawReserveReq, withdrawShareReq]).then(
        Axios.spread((...responses) => {
          const withdrawReserveTransactions = responses[0].data
          const withdrawShareTransactions = responses[1].data

          const withdrawTransactions = withdrawReserveTransactions.concat(
            withdrawShareTransactions,
          )

          return withdrawTransactions
            .map((history) => ({
              events: JSON.parse(history.transaction).events,
              time: history.timestamp,
            }))
            .filter((history) =>
              history.events.some(
                ({ type }) =>
                  type === 'withdraw_share' || type === 'withdraw_reserve',
              ),
            )
            .map((history) => {
              const time = history.time
              const status = 'succeed'
              const description = '—'
              const txHash = '0x00000001111111'
              let amount = 0
              let denom = ''
              const type = 'Bond Reserve'
              let purpose = ''

              const isWithdrawShare = history.events.some(
                ({ type }) => type === 'withdraw_share',
              )
              const isWithdrawReserve = history.events.some(
                ({ type }) => type === 'withdraw_reserve',
              )

              if (isWithdrawShare) {
                const attributes = history.events.find(
                  ({ type }) => type === 'withdraw_share',
                ).attributes
                const value = attributes.find(
                  ({ key }) => key === 'amount',
                ).value
                amount = parseInt(value)
                denom = value.replace(/[0-9]/g, '')
                purpose = 'Share Withdrawal'
              } else if (isWithdrawReserve) {
                const attributes = history.events.find(
                  ({ type }) => type === 'withdraw_reserve',
                ).attributes
                const value = attributes.find(
                  ({ key }) => key === 'amount',
                ).value
                amount = parseInt(value)
                denom = value.replace(/[0-9]/g, '')
                purpose = 'Project Funding'
              }

              return {
                time,
                amount,
                denom,
                status,
                type,
                purpose,
                description,
                txHash,
              }
            })
            .sort((a, b) =>
              new Date(a.time).getTime() < new Date(b.time).getTime() ? 1 : -1,
            )
        }),
      ),
    })
  }

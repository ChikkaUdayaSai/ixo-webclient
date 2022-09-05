import Axios from 'axios'
import * as Toast from 'common/utils/Toast'
import * as base58 from 'bs58'
import keysafe from 'common/keysafe/keysafe'
import { sortObject } from './transformationUtils'
import { RootState } from 'common/redux/types'
import { useSelector } from 'react-redux'

const BLOCKCHAIN_API = process.env.REACT_APP_GAIA_URL

export const broadCastMessage = (
  userInfo,
  userSequence,
  userAccountNumber,
  msgs,
  memo = '',
  fee,
  callback,
): void => {
  const payload = {
    msgs,
    chain_id: process.env.REACT_APP_CHAIN_ID,
    fee,
    memo,
    account_number: String(userAccountNumber),
    sequence: String(userSequence),
  }

  const pubKey = base58.decode(userInfo.didDoc.pubKey).toString('base64')

  keysafe.requestSigning(
    JSON.stringify(sortObject(payload)),
    (error: any, signature: any) => {
      if (error) {
        Toast.errorToast(`Transaction Failed`)
        callback(null)
        return
      }
      const txBody = {
        msg: payload.msgs,
        fee: payload.fee,
        signatures: [
          {
            account_number: payload.account_number,
            sequence: payload.sequence,
            signature: signature.signatureValue,
            pub_key: {
              type: 'tendermint/PubKeyEd25519',
              value: pubKey,
            },
          },
        ],
        memo: '',
      }

      const tx_bytes = Buffer.from(txBody as any).toString('base64')
      Axios.post(`${BLOCKCHAIN_API}/cosmos/tx/v1beta1/txs`, {
        tx_bytes,
        mode: 'BROADCAST_MODE_SYNC',
      })
        ///////////////////////////////////////
        // const pp = {
        //   body: {
        //     messages: payload.msgs,
        //     memo: payload.memo,
        //     timeout_height: '0',
        //     extension_options: [],
        //     non_critical_extension_options: [],
        //   },
        //   auth_info: {
        //     signer_infos: [
        //       {
        //         public_key: pubKey,
        //         mode_info: {
        //           single: {
        //             mode: 'SIGN_MODE_LEGACY_AMINO_JSON',
        //           },
        //         },
        //         sequence: payload.sequence,
        //       },
        //     ],
        //     fee: payload.fee,
        //   },
        //   signatures: [signature.signatureValue],
        // }
        // const tx_bytes = Buffer.from(JSON.stringify(pp)).toString('base64')

        // Axios.post(`${BLOCKCHAIN_API}/cosmos/tx/v1beta1/txs`, {
        //   tx_bytes,
        //   mode: 'BROADCAST_MODE_SYNC',
        // })
        ///////////////////////////////////////
        // Axios.post(`${BLOCKCHAIN_API}/txs`, {
        //   tx: {
        //     msg: payload.msgs,
        //     fee: payload.fee,
        //     signatures: [
        //       {
        //         account_number: payload.account_number,
        //         sequence: payload.sequence,
        //         signature: signature.signatureValue,
        //         pub_key: {
        //           type: 'tendermint/PubKeyEd25519',
        //           value: pubKey,
        //         },
        //       },
        //     ],
        //     memo: '',
        //   },
        //   mode: 'sync',
        // })
        .then((response) => {
          if (response.data.txhash) {
            if (response.data.code === 4) {
              Toast.errorToast(`Transaction Failed`)
              callback(null)
              return
            }
            Toast.successToast(`Transaction Successful`)
            callback(response.data.txhash)
            return
          }

          Toast.errorToast(`Transaction Failed`)
        })
        .catch(() => {
          Toast.errorToast(`Transaction Failed`)
          callback(null)
        })
    },
    'base64',
  )
}

export const useKeysafe = (): any => {
  const {
    userInfo,
    sequence: userSequence,
    accountNumber: userAccountNumber,
  } = useSelector((state: RootState) => state.account)

  const defaultFee = {
    amount: [{ amount: String(5000), denom: 'uixo' }],
    gas: String(200000),
  }

  const sendTransaction = (
    msgs,
    memo = '',
    fee = defaultFee,
  ): Promise<string> => {
    return new Promise((resolve) => {
      const payload = {
        msgs,
        chain_id: process.env.REACT_APP_CHAIN_ID,
        fee,
        memo,
        account_number: String(userAccountNumber),
        sequence: String(userSequence),
      }
      const pubKey = base58.decode(userInfo.didDoc.pubKey).toString('base64')
      keysafe.requestSigning(
        JSON.stringify(sortObject(payload)),
        (error: any, signature: any) => {
          if (error) {
            Toast.errorToast(`Transaction Failed`)
            resolve(null)
            return
          }
          Axios.post(`${BLOCKCHAIN_API}/txs`, {
            tx: {
              msg: payload.msgs,
              fee: payload.fee,
              signatures: [
                {
                  account_number: payload.account_number,
                  sequence: payload.sequence,
                  signature: signature.signatureValue,
                  pub_key: {
                    type: 'tendermint/PubKeyEd25519',
                    value: pubKey,
                  },
                },
              ],
              memo: '',
            },
            mode: 'sync',
          })
            .then((response) => {
              if (response.data.txhash) {
                if (response.data.code === 4) {
                  Toast.errorToast(`Transaction Failed`)
                  resolve(null)
                  return
                }
                Toast.successToast(`Transaction Successful`)
                resolve(response.data.txhash)
                return
              }

              Toast.errorToast(`Transaction Failed`)
            })
            .catch((e) => {
              console.log(e)

              Toast.errorToast(`Transaction Failed`)
              resolve(null)
            })
        },
        'base64',
      )
    })
  }

  return { sendTransaction }
}

import Axios from 'axios'
import * as Toast from 'common/utils/Toast'
import * as base58 from 'bs58'
import keysafe from 'common/keysafe/keysafe'
import { sortObject } from './transformationUtils'
import { RootState } from 'common/redux/types'
import { useSelector } from 'react-redux'
import cosmosclient from '@cosmos-client/core'
import Long from 'long'

export const JsonToArray = (json): Uint8Array => {
  const ret = new Uint8Array(Buffer.from(JSON.stringify(json)))
  return ret
}

export const newBroadCastTx = async (): Promise<void> => {
  ////////////////////////
  const fromAddress = cosmosclient.AccAddress.fromString(
    'ixo19h3lqj50uhzdrv8mkafnp55nqmz4ghc2sd3m48',
  )
  const toAddress = cosmosclient.AccAddress.fromString(
    'ixo1xc798xnhp7yy9mpp80v3tsxppw8qk0y9atm965',
  )
  const sdk = new cosmosclient.CosmosSDK(
    'https://testnet.ixo.world/rpc/',
    'pandora-5',
  )

  const privKey = new cosmosclient.proto.cosmos.crypto.ed25519.PrivKey({
    key: fromAddress.value(),
  })
  const pubKey = privKey.pubKey()

  // get account info
  const account = await cosmosclient.rest.auth
    .account(sdk, fromAddress)
    .then((res) =>
      cosmosclient.codec.protoJSONToInstance(
        cosmosclient.codec.castProtoJSONOfProtoAny(res.data.account),
      ),
    )
    .catch(() => undefined)

  if (
    !(account instanceof cosmosclient.proto.cosmos.auth.v1beta1.BaseAccount)
  ) {
    console.log(account)
    return
  }

  // build tx
  const msgSend = new cosmosclient.proto.cosmos.bank.v1beta1.MsgSend({
    from_address: fromAddress.toString(),
    to_address: toAddress.toString(),
    amount: [{ denom: 'uixo', amount: '1' }],
  })

  const txBody = new cosmosclient.proto.cosmos.tx.v1beta1.TxBody({
    messages: [cosmosclient.codec.instanceToProtoAny(msgSend)],
  })
  const authInfo = new cosmosclient.proto.cosmos.tx.v1beta1.AuthInfo({
    signer_infos: [
      {
        public_key: cosmosclient.codec.instanceToProtoAny(pubKey),
        mode_info: {
          single: {
            mode:
              cosmosclient.proto.cosmos.tx.signing.v1beta1.SignMode
                .SIGN_MODE_DIRECT,
          },
        },
        sequence: account.sequence,
      },
    ],
    fee: {
      gas_limit: Long.fromString('200000'),
    },
  })

  // sign
  const txBuilder = new cosmosclient.TxBuilder(sdk, txBody, authInfo)
  const signDocBytes = txBuilder.signDocBytes(account.account_number)
  txBuilder.addSignature(privKey.sign(signDocBytes))

  // broadcast
  const res = await cosmosclient.rest.tx.broadcastTx(sdk, {
    tx_bytes: txBuilder.txBytes(),
    mode: cosmosclient.rest.tx.BroadcastTxMode.Block,
  })

  console.log(res)
}

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
      const tx = {
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
      //   Axios.post(`${process.env.REACT_APP_GAIA_URL}/cosmos/tx/v1beta1/txs`, {
      //     tx_bytes: txBuilder.txBytes(),
      //     mode: 'BROADCAST_MODE_SYNC',
      //   })
      //     .then((response) => {
      //       if (response.data.txhash) {
      //         if (response.data.code === 4) {
      //           Toast.errorToast(`Transaction Failed`)
      //           callback(null)
      //           return
      //         }
      //         Toast.successToast(`Transaction Successful`)
      //         callback(response.data.txhash)
      //         return
      //       }

      //       Toast.errorToast(`Transaction Failed`)
      //     })
      //     .catch(() => {
      //       Toast.errorToast(`Transaction Failed`)
      //       callback(null)
      //     })
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
          Axios.post(`${process.env.REACT_APP_GAIA_URL}/txs`, {
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

import { RootState } from 'common/redux/types'
import Axios from 'axios'
import * as base58 from 'bs58'
import { useSelector } from 'react-redux'
import keysafe from 'common/keysafe/keysafe'
import { sortObject } from './transformationUtils'
import * as keplr from 'common/utils/keplr'
import { WalletType } from 'modules/Account/types'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { assertIsBroadcastTxSuccess } from '@cosmjs/stargate'

const BLOCKCHAIN_REST_API = process.env.REACT_APP_GAIA_URL

export function useWallet(): any {
  const { userInfo, keplrWallet, accountNumber, sequence } = useSelector(
    (state: RootState) => state.account,
  )

  const signKeysafe = async (payload: any): Promise<any> => {
    return new Promise((resolve) => {
      keysafe.requestSigning(
        JSON.stringify(sortObject(payload)),
        (error: any, signature: any) => {
          if (error) {
            resolve(null)
          } else {
            resolve(signature.signatureValue)
          }
        },
        'base64',
      )
    })
  }

  const signKeplr = async (payload: any): Promise<any> => {
    const client = await keplr.initStargateClient(keplrWallet.offlineSigner)
    return await client.sign(
      keplrWallet.address,
      payload.msgs,
      payload.fee,
      payload.memo,
    )
  }

  // return signature
  const sign = async (walletType: WalletType, payload: any): Promise<any> => {
    switch (walletType) {
      case WalletType.Keysafe:
        return await signKeysafe(payload)
      case WalletType.Keplr:
        return await signKeplr(payload)
      default:
        break
    }
  }

  const broadcastKeysafe = async (payload: any, sig: any): Promise<any> => {
    const pubKey = base58.decode(userInfo.didDoc.pubKey).toString('base64')
    return new Promise((resolve) => {
      Axios.post(`${BLOCKCHAIN_REST_API}/txs`, {
        tx: {
          msg: payload.msgs,
          fee: payload.fee,
          signatures: [
            {
              account_number: accountNumber,
              sequence: sequence,
              signature: sig.signatureValue,
              pub_key: {
                type: 'tendermint/PubKeyEd25519',
                value: pubKey,
              },
            },
          ],
          memo: payload.memo,
        },
        mode: 'sync',
      })
        .then((response) => response.data)
        .then((response) => {
          if (
            response.txhash &&
            response.code !== 4 &&
            response.logs !== null
          ) {
            resolve(response.txhash)
          }
          resolve(null)
        })
        .catch(() => {
          resolve(null)
        })
    })
  }

  const broadcastKeplr = async (sig: any): Promise<any> => {
    const client = await keplr.initStargateClient(keplrWallet.offlineSigner)
    const result = await client.broadcastTx(
      Uint8Array.from(TxRaw.encode(sig).finish()),
    )
    assertIsBroadcastTxSuccess(result)
    return result?.transactionHash ?? null
  }

  const broadcast = async (
    walletType: WalletType,
    payload: any,
    sig: any,
  ): Promise<any> => {
    switch (walletType) {
      case WalletType.Keysafe:
        return await broadcastKeysafe(payload, sig)
      case WalletType.Keplr:
        return await broadcastKeplr(sig)
      default:
        break
    }
  }

  return {
    sign,
    broadcast,
  }
}

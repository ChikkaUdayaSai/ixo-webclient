import keysafe from 'common/keysafe/keysafe'
import { RootState } from 'common/redux/types'
import * as keplr from 'common/utils/keplr'
import { WalletType } from 'modules/Account/types'
import { useSelector } from 'react-redux'
import { sortObject } from './transformationUtils'

export function useSign(): any {
  const { keplrWallet } = useSelector((state: RootState) => state.account)

  async function signKeysafe(payload: any): Promise<any> {
    return new Promise((resolve) => {
      keysafe.requestSigning(
        JSON.stringify(sortObject(payload)),
        async (error: any, signature: any) => {
          if (error) {
            resolve(null)
          } else {
            console.log('signature', signature)
            const { publicKey } = signature

            const client = await keplr.initStargateClient(null)
            const sig = await client.generateSignObj(
              'ixo19h3lqj50uhzdrv8mkafnp55nqmz4ghc2sd3m48',
              publicKey,
              payload.msgs,
              payload.fee,
              payload.memo,
              {
                accountNumber: payload.account_number,
                sequence: payload.sequence,
                chainId: payload.chain_id,
              },
            )

            console.log(11111111111, sig)

            resolve(signature.publicKey)
          }
        },
        'base64',
      )
    })
  }
  async function signKeplr(payload: any): Promise<any> {
    const client = await keplr.initStargateClient(keplrWallet.offlineSigner)
    return await client.sign(
      keplrWallet.address,
      payload.msgs,
      payload.fee,
      payload.memo,
    )
  }

  async function sign(walletType: WalletType, payload: string): Promise<any> {
    switch (walletType) {
      case WalletType.Keysafe:
        return await signKeysafe(payload)
      case WalletType.Keplr:
        return await signKeplr(payload)
      default:
        break
    }
  }

  return { sign }
}

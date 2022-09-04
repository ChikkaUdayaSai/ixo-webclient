import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { assertIsBroadcastTxSuccess } from '@cosmjs/stargate'
import { fromBase64 } from '@cosmjs/encoding'
import { RootState } from 'common/redux/types'
import * as keplr from 'common/utils/keplr'
import * as keysafe from 'common/utils/keysafe'
import { useSelector } from 'react-redux'
import { base58_to_binary } from 'base58-js'

export function useBroadcast(): any {
  const { keplrWallet } = useSelector((state: RootState) => state.account)

  const broadcast = async (sig: any): Promise<any> => {
    const client = await keplr.initStargateClient(keysafe)
    // console.log('broadcast', sig) //  W0vCAp7L1sSuK7ltFdBHjm2oTS1kt0s8VTgXdwIdpCnoiq4a6FD/CF7yh2CzigRowb0g6xWxlCTrHYgcZwM4Bg==

    // console.log('encoding', Uint8Array.from(fromBase64(sig)))

    // console.log('TxRaw', TxRaw.encode(sig))
    // console.log('TxRaw.finish', TxRaw.encode(sig).finish())
    // console.log(
    //   'Uint8Array from TxRaw.finish',
    //   Uint8Array.from(TxRaw.encode(sig).finish()),
    // )
    const result = await client.broadcastTx(
      Uint8Array.from(TxRaw.encode(sig).finish()),
      // Uint8Array.from(fromBase64(sig)),
    )
    assertIsBroadcastTxSuccess(result)
    return result?.transactionHash ?? null
  }

  return { broadcast }
}

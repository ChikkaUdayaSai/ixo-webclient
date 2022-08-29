import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { assertIsBroadcastTxSuccess } from '@cosmjs/stargate'
import { RootState } from 'common/redux/types'
import * as keplr from 'common/utils/keplr'
import * as keysafe from 'common/utils/keysafe'
import { useSelector } from 'react-redux'

export function useBroadcast(): any {
  const { keplrWallet } = useSelector((state: RootState) => state.account)

  const broadcast = async (sig: any): Promise<any> => {
    const client = await keplr.initStargateClient(keysafe)
    console.log('broadcast', sig)

    console.log('TxRaw', TxRaw.encode(sig))
    console.log('TxRaw.finish', TxRaw.encode(sig).finish())
    console.log(
      'Uint8Array from TxRaw.finish',
      Uint8Array.from(TxRaw.encode(sig).finish()),
    )
    const result = await client.broadcastTx(
      Uint8Array.from(TxRaw.encode(sig).finish()),
    )
    assertIsBroadcastTxSuccess(result)
    return result?.transactionHash ?? null
  }

  return { broadcast }
}

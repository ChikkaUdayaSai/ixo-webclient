import { Registry } from '@cosmjs/proto-signing'
import { defaultRegistryTypes as defaultStargateTypes } from '@cosmjs/stargate'
import { Coin } from './codec/cosmos/coin'
import { MsgSend } from './codec/external/cosmos/bank/v1beta1/tx'
import { SigningStargateClient } from './utils/customClient'
import { accountFromAny } from './utils/EdAccountHandler'
import * as keysafe from 'common/keysafe/keysafe'

console.log(1111, keysafe)

interface fee {
  amount: {
    denom: string // Use the appropriate fee denom for your chain
    amount: string
  }[]
  gas: string
}

export const messageSend = async (
  signer: any,
  fromAddress: string,
  toAddress: string,
  denom: string,
  amountInUixo: string,
  fee: any,
) => {
  const myRegistry = new Registry(defaultStargateTypes)
  myRegistry.register('/cosmos.bank.v1beta1.MsgSend', MsgSend)

  const client = await SigningStargateClient.connectWithSigner(
    'https://testnet.ixo.earth/rpc/',
    signer,
    {
      registry: myRegistry,
      accountParser: accountFromAny,
    },
  )

  const message = {
    typeUrl: '/cosmos.bank.v1beta1.MsgSend',
    value: MsgSend.fromPartial({
      fromAddress: fromAddress,
      toAddress: toAddress,
      amount: [
        Coin.fromPartial({
          denom: denom,
          amount: amountInUixo,
        }),
      ],
    }),
  }

  const response = await client.signAndBroadcast(fromAddress, [message], fee)
  return response
}

import { Coin } from '@cosmjs/proto-signing'
import { getAuthAccount } from './ixo.helpers'

const chainId = process.env.REACT_APP_CHAIN_ID

function getFee(): any {
  const fee = {
    amount: [{ amount: String(5000), denom: 'uixo' }],
    gas: String(200000),
  }
  return fee
}

async function getStdSignDoc(
  authAddress: string,
  msg: { typeUrl: string; value: any },
): Promise<any> {
  const { accountNumber, sequence } = await getAuthAccount(authAddress)
  const memo = ''
  const stdSignDoc = {
    chain_id: chainId,
    account_number: accountNumber,
    sequence: sequence,
    fee: getFee(),
    msgs: [msg],
    memo: memo,
  }
  return stdSignDoc
}

export async function getMsgSendStdSignDoc(
  authAddress: string,
  toAddress: string,
  amount: Coin,
): Promise<any> {
  const msg = {
    typeUrl: '/cosmos.bank.v1beta1.MsgSend',
    value: {
      amount: [amount],
      fromAddress: authAddress,
      toAddress: toAddress,
    },
  }
  return await getStdSignDoc(authAddress, msg)
}

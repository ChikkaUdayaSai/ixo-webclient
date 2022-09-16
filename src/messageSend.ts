import {
  AccountData,
  DirectSignResponse,
  OfflineSigner,
  Registry,
} from '@cosmjs/proto-signing'
import { fromBase64, toBase64 } from '@cosmjs/encoding'
import { defaultRegistryTypes as defaultStargateTypes } from '@cosmjs/stargate'
import { Coin } from './codec/cosmos/coin'
import { MsgSend } from './codec/external/cosmos/bank/v1beta1/tx'
import { SigningStargateClient } from './utils/customClient'
import { accountFromAny } from './utils/EdAccountHandler'
import keysafe from 'common/keysafe/keysafe'
import { SignDoc } from 'codec/external/cosmos/tx/v1beta1/tx'
import { pubkeyType } from '@cosmjs/amino'

const getKeysafeDidDoc = async (): Promise<any> => {
  return new Promise((resolve) => {
    keysafe.getInfo((error: any, response: any) => {
      if (!error && response) {
        const { didDoc } = response
        resolve(didDoc)
      } else {
        resolve(undefined)
      }
    })
  })
}
const createSignature = async (payload: any): Promise<Uint8Array> => {
  return new Promise((resolve) => {
    keysafe.requestSigning(
      JSON.stringify(payload),
      async (error: any, signature: any) => {
        if (error || !signature) {
          resolve(new Uint8Array())
        } else {
          console.log('signature', signature)
          resolve(fromBase64(signature.signatureValue))
        }
      },
      'base64',
    )
  })
}

function encodeEd25519Pubkey(pubkey): any {
  return {
    type: pubkeyType.ed25519,
    value: toBase64(pubkey),
  }
}

function encodeEd25519Signature(pubkey: any, signature: any): any {
  if (signature.length !== 64) {
    throw new Error(
      'Signature must be 64 bytes long. Cosmos SDK uses a 2x32 byte fixed length encoding for the Ed25519 signature integers r and s.',
    )
  }
  return {
    pub_key: encodeEd25519Pubkey(pubkey),
    signature: toBase64(signature),
  }
}

export const messageSend = async (
  signer: any,
  fromAddress: string,
  toAddress: string,
  denom: string,
  amountInUixo: string,
  fee: any,
): Promise<void> => {
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

  const messages = [
    {
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
    },
  ]

  const response = await client.signAndBroadcast(fromAddress, messages, fee)
  return response
}

export const messageSendKeysafe = async (
  fromAddress: string,
  toAddress: string,
  denom: string,
  amountInUixo: string,
  fee: any,
): Promise<void> => {
  const messages = [
    {
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
    },
  ]

  const { pubKey } = await getKeysafeDidDoc()
  console.log('pubKey', pubKey)
  const getAccounts = (): Promise<AccountData[]> => {
    return new Promise((resolve) => {
      resolve([
        {
          address: fromAddress,
          algo: 'ed25519',
          pubkey: fromBase64(pubKey),
        },
      ])
    })
  }
  const signDirect = async (
    address: string,
    signDoc: SignDoc,
  ): Promise<DirectSignResponse> => {
    const signature = await createSignature(messages)

    console.log('createSignature', signature)

    const signatureBytes = new Uint8Array(signature.slice(0, 64))
    const stdSignature = encodeEd25519Signature(pubKey, signatureBytes)
    return {
      signed: signDoc,
      signature: stdSignature,
    }
  }

  const offlineSigner: OfflineSigner = {
    getAccounts,
    signDirect,
  }

  await messageSend(
    offlineSigner,
    fromAddress,
    toAddress,
    denom,
    amountInUixo,
    fee,
  )
}

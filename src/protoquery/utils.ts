import { sha256 } from '@cosmjs/crypto';
import { Bech32, fromBase64, toBase64, toUtf8 } from '@cosmjs/encoding';
import {
  OfflineSigner,
  DirectSecp256k1HdWallet,
  Registry,
  decodeTxRaw,
} from '@cosmjs/proto-signing';
import { SigningStargateClient } from '@cosmjs/stargate';
import { decode } from 'bs58';
import { base58_to_binary } from 'base58-js';
import {
  decodeAminoPubkey,
  decodeBech32Pubkey,
  serializeSignDoc,
} from '@cosmjs/amino';
const sovrin = require('sovrin-did');

export async function initializesigner(
  Mnemonic: string,
): Promise<OfflineSigner> {
  const signer = await DirectSecp256k1HdWallet.fromMnemonic(Mnemonic, {
    prefix: 'ixo',
  });

  return signer;
}

export async function initializeclient(
  signer: OfflineSigner,
  rpcendpoint = 'https://testnet.ixo.earth/rpc/',
  myRegistry: any,
): Promise<SigningStargateClient> {
  const client = await SigningStargateClient.connectWithSigner(
    rpcendpoint,
    signer,
    { registry: myRegistry },
  );

  return client;
}

export async function parseTx(tx: string, registry: Registry): Promise<any> {
  const decoded = decodeTxRaw(fromBase64(tx));
  const parsedData = [];
  for (const message of decoded.body.messages) {
    const decodedMsg = registry.decode(message);
    parsedData.push(decodedMsg);
  }
  return parsedData;
}

// JSON to Uint8Array parsing and visa versa
export const JsonToArray = function(json) {
  var ret = new Uint8Array(Buffer.from(json));
  return ret;
};

function Utf8ArrayToStr(array: any) {
  let out, i, c;
  let char2, char3;

  out = '';
  const len = array.length;
  i = 0;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12:
      case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(
          ((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0),
        );
        break;
    }
  }

  return out;
}
// Converts A Unit8Array to String
export function Uint8ArrayToJS(data: Uint8Array): string {
  const decodedData = Utf8ArrayToStr(data);
  return decodedData;
}

export const getPublicKey = () => {
  const mnemonic =
    'creek obvious bamboo ozone dwarf above hill muscle image fossil drastic toy';

  // Creating diddoc from MM - edkeys
  const didDoc = sovrin.fromSeed(sha256(toUtf8(mnemonic)).slice(0, 32));

  console.log('diddoc-', didDoc);

  // const pubKey = toBase64(pub_keyBase64).toString();

  const edClient = {
    mnemonic,
    didDoc,
    didPrefix: 'did:ixo:',
    did: 'did:ixo:' + didDoc.did,
    didSov: 'did:sov:' + didDoc.did,

    async getAccounts() {
      return [
        {
          algo: 'ed25519-sha-256',
          pubkey: Uint8Array.from(base58_to_binary(didDoc.verifyKey)),
          address: Bech32.encode(
            'ixo',
            sha256(base58_to_binary(didDoc.verifyKey)).slice(0, 20),
          ),
        },
      ];
    },
    async signAmino(signerAddress: any, signDoc: any) {
      const account = (await this.getAccounts()).find(
        ({ address }) => address === signerAddress,
      );

      if (!account)
        throw new Error(`Address ${signerAddress} not found in wallet`);

      const fullSignature = sovrin.signMessage(
        serializeSignDoc(signDoc),
        didDoc.secret.signKey,
        didDoc.verifyKey,
      );
      const signatureBase64 = toBase64(fullSignature.slice(0, 64));
      const pub_keyBase64 = base58_to_binary(didDoc.verifyKey);
      return {
        signed: signDoc,

        signature: {
          signature: signatureBase64,

          pub_key: {
            type: 'tendermint/PubKeyEd25519',
            value: toBase64(pub_keyBase64).toString(),
          },
        },
      };
    },
  };

  return edClient;
};

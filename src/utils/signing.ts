import { coins, encodeSecp256k1Pubkey, StdFee } from '@cosmjs/amino';
import {
  EncodeObject,
  encodePubkey,
  isOfflineDirectSigner,
  makeAuthInfoBytes,
  makeSignDoc,
  TxBodyEncodeObject,
} from '@cosmjs/proto-signing';
import { DeliverTxResponse, SignerData } from '@cosmjs/stargate';
import { assert, assertDefined } from '@cosmjs/utils';
import { Decimal, Uint53, Int53 } from '@cosmjs/math';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { fromBase64 } from '@cosmjs/encoding';
import { GasPrice } from './gasPrice';

const signAndBroadcast = async (
  signerAddress: string,
  messages: readonly EncodeObject[],
  fee: StdFee | 'auto' | number,
  memo = '',
): Promise<DeliverTxResponse> => {
  let usedFee: StdFee;
  if (fee == 'auto' || typeof fee === 'number') {
    assertDefined(
      gasPrice,
      'Gas price must be set in the client options when auto gas is used.',
    );
    const gasEstimation = await simulate(signerAddress, messages, memo);
    const multiplier = typeof fee === 'number' ? fee : 1.3;
    usedFee = calculateFee(Math.round(gasEstimation * multiplier), gasPrice);
  } else {
    usedFee = fee;
  }
  const txRaw = await sign(signerAddress, messages, usedFee, memo);
  const txBytes = TxRaw.encode(txRaw).finish();
  return this.broadcastTx(
    txBytes,
    this.broadcastTimeoutMs,
    this.broadcastPollIntervalMs,
  );
};

/**
 * Gets account number and sequence from the API, creates a sign doc,
 * creates a single signature and assembles the signed transaction.
 *
 * The sign mode (SIGN_MODE_DIRECT or SIGN_MODE_LEGACY_AMINO_JSON) is determined by this client's signer.
 *
 * You can pass signer data (account number, sequence and chain ID) explicitly instead of querying them
 * from the chain. This is needed when signing for a multisig account, but it also allows for offline signing
 * (See the SigningStargateClient.offline constructor).
 */
const sign = async (
  signerAddress: string,
  messages: readonly EncodeObject[],
  fee: StdFee,
  memo: string,
  explicitSignerData?: SignerData,
): Promise<TxRaw> => {
  let signerData: SignerData;
  if (explicitSignerData) {
    signerData = explicitSignerData;
  } else {
    const { accountNumber, sequence } = await getSequence(signerAddress);
    const chainId = await this.getChainId();
    signerData = {
      accountNumber: accountNumber,
      sequence: sequence,
      chainId: chainId,
    };
  }

  return isOfflineDirectSigner(this.signer)
    ? signDirect(signerAddress, messages, fee, memo, signerData)
    : signAmino(signerAddress, messages, fee, memo, signerData);
};

const signAmino = async (
  signerAddress: string,
  messages: readonly EncodeObject[],
  fee: StdFee,
  memo: string,
  { accountNumber, sequence, chainId }: SignerData,
): Promise<TxRaw> => {
  assert(!isOfflineDirectSigner(this.signer));
  const accountFromSigner = (await this.signer.getAccounts()).find(
    account => account.address === signerAddress,
  );
  if (!accountFromSigner) {
    throw new Error('Failed to retrieve account from signer');
  }
  const pubkey = encodePubkey(encodeSecp256k1Pubkey(accountFromSigner.pubkey));
  const signMode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON;
  const msgs = messages.map(msg => this.aminoTypes.toAmino(msg));
  const signDoc = makeSignDocAmino(
    msgs,
    fee,
    chainId,
    memo,
    accountNumber,
    sequence,
  );
  const { signature, signed } = await this.signer.signAmino(
    signerAddress,
    signDoc,
  );
  const signedTxBody = {
    messages: signed.msgs.map(msg => this.aminoTypes.fromAmino(msg)),
    memo: signed.memo,
  };
  const signedTxBodyEncodeObject: TxBodyEncodeObject = {
    typeUrl: '/cosmos.tx.v1beta1.TxBody',
    value: signedTxBody,
  };
  const signedTxBodyBytes = this.registry.encode(signedTxBodyEncodeObject);
  const signedGasLimit = Int53.fromString(signed.fee.gas).toNumber();
  const signedSequence = Int53.fromString(signed.sequence).toNumber();
  const signedAuthInfoBytes = makeAuthInfoBytes(
    [{ pubkey, sequence: signedSequence }],
    signed.fee.amount,
    signedGasLimit,
    signMode,
  );
  return TxRaw.fromPartial({
    bodyBytes: signedTxBodyBytes,
    authInfoBytes: signedAuthInfoBytes,
    signatures: [fromBase64(signature.signature)],
  });
};

const signDirect = async (
  signerAddress: string,
  messages: readonly EncodeObject[],
  fee: StdFee,
  memo: string,
  { accountNumber, sequence, chainId }: SignerData,
): Promise<TxRaw> => {
  assert(isOfflineDirectSigner(this.signer));
  const accountFromSigner = (await this.signer.getAccounts()).find(
    account => account.address === signerAddress,
  );
  if (!accountFromSigner) {
    throw new Error('Failed to retrieve account from signer');
  }
  const pubkey = encodePubkey(encodeSecp256k1Pubkey(accountFromSigner.pubkey));
  const txBodyEncodeObject: TxBodyEncodeObject = {
    typeUrl: '/cosmos.tx.v1beta1.TxBody',
    value: {
      messages: messages,
      memo: memo,
    },
  };
  const txBodyBytes = this.registry.encode(txBodyEncodeObject);
  const gasLimit = Int53.fromString(fee.gas).toNumber();
  const authInfoBytes = makeAuthInfoBytes(
    [{ pubkey, sequence }],
    fee.amount,
    gasLimit,
  );
  const signDoc = makeSignDoc(
    txBodyBytes,
    authInfoBytes,
    chainId,
    accountNumber,
  );
  const { signature, signed } = await this.signer.signDirect(
    signerAddress,
    signDoc,
  );
  return TxRaw.fromPartial({
    bodyBytes: signed.bodyBytes,
    authInfoBytes: signed.authInfoBytes,
    signatures: [fromBase64(signature.signature)],
  });
};

const simulate = async (
  signerAddress: string,
  messages: readonly EncodeObject[],
  memo: string | undefined,
): Promise<number> => {
  const anyMsgs = messages.map(m => this.registry.encodeAsAny(m));
  const accountFromSigner = (await this.signer.getAccounts()).find(
    account => account.address === signerAddress,
  );
  if (!accountFromSigner) {
    throw new Error('Failed to retrieve account from signer');
  }
  const pubkey = encodeSecp256k1Pubkey(accountFromSigner.pubkey);
  const { sequence } = await this.getSequence(signerAddress);
  const { gasInfo } = await this.forceGetQueryClient().tx.simulate(
    anyMsgs,
    memo,
    pubkey,
    sequence,
  );
  assertDefined(gasInfo);
  return Uint53.fromString(gasInfo.gasUsed.toString()).toNumber();
};

const getSequence = (address: string): Promise<SequenceResponse> => {
  const account = await this.getAccount(address);
  if (!account) {
    throw new Error(
      'Account does not exist on chain. Send some tokens there before trying to query sequence.',
    );
  }
  return {
    accountNumber: account.accountNumber,
    sequence: account.sequence,
  };
};

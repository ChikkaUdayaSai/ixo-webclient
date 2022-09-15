/* eslint-disable @typescript-eslint/naming-convention */
import { AminoMsg, Coin } from '@cosmjs/amino';
import { AminoConverters } from '@cosmjs/stargate';
import { MsgMultiSend, MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { MsgCreateProject } from './tx';

// eslint-disable-next-line import/no-cycle

/** A high level transaction of the coin module */
export interface AminoProjectCreate extends AminoMsg {
  readonly type: 'project.MsgCreateProject';
  readonly value: {
    readonly txHash: string;
    readonly senderDid: string;
    readonly projectDid: string;
    readonly pubKey: string;
    readonly data: Uint8Array;
  };
}

export function isAminoProjectCreate(msg: AminoMsg): msg is AminoProjectCreate {
  return msg.type === 'project.MsgCreateProject';
}

interface Input {
  /** Bech32 account address */
  readonly address: string;
  readonly coins: readonly Coin[];
}

interface Output {
  /** Bech32 account address */
  readonly address: string;
  readonly coins: readonly Coin[];
}

/** A high level transaction of the coin module */
export interface AminoMsgMultiSend extends AminoMsg {
  readonly type: 'cosmos-sdk/MsgMultiSend';
  readonly value: {
    readonly inputs: readonly Input[];
    readonly outputs: readonly Output[];
  };
}

export function isAminoMsgMultiSend(msg: AminoMsg): msg is AminoMsgMultiSend {
  return msg.type === 'cosmos-sdk/MsgMultiSend';
}

export function createProjectAminoConverters(): AminoConverters {
  return {
    '/project.MsgCreateProject': {
      aminoType: 'project.MsgCreateProject',

      toAmino: ({
        txHash,
        senderDid,
        projectDid,
        pubKey,
        data,
      }: MsgCreateProject): AminoProjectCreate['value'] => ({
        txHash: txHash,
        senderDid: senderDid,
        projectDid: projectDid,
        pubKey: pubKey,
        data: data,
      }),
      fromAmino: ({
        txHash,
        senderDid,
        projectDid,
        pubKey,
        data,
      }: AminoProjectCreate['value']): MsgCreateProject => ({
        txHash: txHash,
        senderDid: senderDid,
        projectDid: projectDid,
        pubKey: pubKey,
        data: data,
      }),
    },
    '/cosmos.bank.v1beta1.MsgMultiSend': {
      aminoType: 'cosmos-sdk/MsgMultiSend',
      toAmino: ({
        inputs,
        outputs,
      }: MsgMultiSend): AminoMsgMultiSend['value'] => ({
        inputs: inputs.map(input => ({
          address: input.address,
          coins: [...input.coins],
        })),
        outputs: outputs.map(output => ({
          address: output.address,
          coins: [...output.coins],
        })),
      }),
      fromAmino: ({
        inputs,
        outputs,
      }: AminoMsgMultiSend['value']): MsgMultiSend => ({
        inputs: inputs.map(input => ({
          address: input.address,
          coins: [...input.coins],
        })),
        outputs: outputs.map(output => ({
          address: output.address,
          coins: [...output.coins],
        })),
      }),
    },
  };
}

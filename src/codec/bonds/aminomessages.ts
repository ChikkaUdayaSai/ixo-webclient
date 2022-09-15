/* eslint-disable @typescript-eslint/naming-convention */
import { AminoMsg, Coin } from '@cosmjs/amino';
import { AminoConverters } from '@cosmjs/stargate';
import { FunctionParam } from './bonds';
import { MsgCreateBond } from './tx';

// eslint-disable-next-line import/no-cycle

/** A high level transaction of the coin module */
export interface AminoBondCreate extends AminoMsg {
  readonly type: 'bonds.MsgCreateBond';
  readonly value: {
    readonly token: string;
    readonly name: string;
    readonly description: string;
    readonly creatorDid: string;
    readonly controllerDid: string;
    readonly functionType: string;
    readonly functionParameters: FunctionParam[];
    readonly reserveTokens: string[];
    readonly txFeePercentage: string;
    readonly exitFeePercentage: string;
    readonly feeAddress: string;
    readonly reserveWithdrawalAddress: string;
    readonly maxSupply: Coin;
    readonly orderQuantityLimits: Coin[];
    readonly sanityRate: string;
    readonly sanityMarginPercentage: string;
    readonly allowSells: boolean;
    readonly allowReserveWithdrawals: boolean;
    readonly alphaBond: boolean;
    readonly batchBlocks: string;
    readonly outcomePayment: string;
    readonly bondDid: string;
  };
}

export function isAminoBondCreate(msg: AminoMsg): msg is AminoBondCreate {
  return msg.type === 'bonds.MsgCreateBond';
}
export function createBondAminoConverters(): AminoConverters {
  return {
    '/bonds.MsgCreateBond': {
      aminoType: 'bonds.MsgCreateBond',

      toAmino: ({
        token,
        name,
        description,
        creatorDid,
        controllerDid,
        functionType,
        functionParameters,
        reserveTokens,
        txFeePercentage,
        exitFeePercentage,
        feeAddress,
        reserveWithdrawalAddress,
        maxSupply,
        orderQuantityLimits,
        sanityRate,
        sanityMarginPercentage,
        allowSells,
        allowReserveWithdrawals,
        alphaBond,
        batchBlocks,
        outcomePayment,
        bondDid,
      }: MsgCreateBond): AminoBondCreate['value'] => ({
        token: token,
        name: name,
        description: description,
        creatorDid: creatorDid,
        controllerDid: controllerDid,
        functionType: functionType,
        functionParameters: functionParameters,
        reserveTokens: reserveTokens,
        txFeePercentage: txFeePercentage,
        exitFeePercentage: exitFeePercentage,
        feeAddress: feeAddress,
        reserveWithdrawalAddress: reserveWithdrawalAddress,
        maxSupply: maxSupply,
        orderQuantityLimits: orderQuantityLimits,
        sanityRate: sanityRate,
        sanityMarginPercentage: sanityMarginPercentage,
        allowSells: allowSells,
        allowReserveWithdrawals: allowReserveWithdrawals,
        alphaBond: alphaBond,
        batchBlocks: batchBlocks,
        outcomePayment: outcomePayment,
        bondDid: bondDid,
      }),
      fromAmino: ({
        token,
        name,
        description,
        creatorDid,
        controllerDid,
        functionType,
        functionParameters,
        reserveTokens,
        txFeePercentage,
        exitFeePercentage,
        feeAddress,
        reserveWithdrawalAddress,
        maxSupply,
        orderQuantityLimits,
        sanityRate,
        sanityMarginPercentage,
        allowSells,
        allowReserveWithdrawals,
        alphaBond,
        batchBlocks,
        outcomePayment,
        bondDid,
      }: AminoBondCreate['value']): MsgCreateBond => ({
        token: token,
        name: name,
        description: description,
        creatorDid: creatorDid,
        controllerDid: controllerDid,
        functionType: functionType,
        functionParameters: functionParameters,
        reserveTokens: reserveTokens,
        txFeePercentage: txFeePercentage,
        exitFeePercentage: exitFeePercentage,
        feeAddress: feeAddress,
        reserveWithdrawalAddress: reserveWithdrawalAddress,
        maxSupply: maxSupply,
        orderQuantityLimits: orderQuantityLimits,
        sanityRate: sanityRate,
        sanityMarginPercentage: sanityMarginPercentage,
        allowSells: allowSells,
        allowReserveWithdrawals: allowReserveWithdrawals,
        alphaBond: alphaBond,
        batchBlocks: batchBlocks,
        outcomePayment: outcomePayment,
        bondDid: bondDid,
      }),
    },
  };
}

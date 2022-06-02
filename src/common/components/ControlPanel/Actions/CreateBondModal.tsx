import React, { useEffect, useMemo, useState } from 'react'
import Lottie from 'react-lottie'
import styled from 'styled-components'
import { StepsTransactions } from 'common/components/StepsTransactions/StepsTransactions'
import { broadCastMessage } from 'common/utils/keysafe'
import { useSelector, useDispatch } from 'react-redux'

import EyeIcon from 'assets/images/eye-icon.svg'
import NextStepIcon from 'assets/images/modal/nextstep.svg'

import pendingAnimation from 'assets/animations/transaction/pending.json'
import successAnimation from 'assets/animations/transaction/success.json'
import errorAnimation from 'assets/animations/transaction/fail.json'
import { AlphaBondInfo } from 'modules/Entities/CreateEntity/CreateTemplate/types'
import { Container, NextStep, TXStatusBoard, PrevStep } from './Modal.styles'
import AlphabondIcon from 'assets/images/alpha-icon.svg'
import RingIcon from 'assets/images/ring.svg'
import { denomToMinimalDenom } from 'modules/Account/Account.utils'
import { updateAlphaBondInfo } from 'modules/Entities/CreateEntity/CreateTemplate/CreateTemplate.action'
import { RootState } from 'common/redux/types'
import * as Toast from 'common/utils/Toast'

import sov from 'sovrin-did'
import { unset } from 'lodash'

const InfoBox = styled.div`
  background: #03324a;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 15px;

  & > img {
    background: #053f5c;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 0.625rem;
    padding: 5px;
  }

  & > span {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    font-size: 15px;
    line-height: 22px;
  }
`

const DescriptionInput = styled.input`
  background: #03324a;
  border: 1px solid #49bfe0;
  border-radius: 4px;
  color: white;
  padding: 15px;
  outline: none;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 700;
  font-size: 15px;
  line-height: 22px;
  width: 100%;

  &::placeholder {
    color: #537b8e;
  }
`

enum TXStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
}
interface Props {
  alphaBondInfo: AlphaBondInfo
}

const CreateBondModal: React.FunctionComponent<Props> = ({ alphaBondInfo }) => {
  const dispatch = useDispatch()
  const [steps] = useState(['Identify', 'Sign'])
  const [currentStep, setCurrentStep] = useState<number>(0)

  const [signTXStatus, setSignTXStatus] = useState<TXStatus>(TXStatus.PENDING)
  const [signTXhash, setSignTXhash] = useState<string>(null)

  const [bondDescription, setBondDescription] = useState<string>('')

  const bondDid = useMemo(() => {
    const { did } = sov.gen()
    return 'did:ixo:' + did
    // eslint-disable-next-line
  }, [alphaBondInfo])

  const {
    userInfo,
    sequence: userSequence,
    accountNumber: userAccountNumber,
  } = useSelector((state: RootState) => state.account)

  const handlePrevStep = (): void => {
    if (currentStep === 0) {
      return
    }
    setCurrentStep(currentStep - 1)
  }
  const handleNextStep = async (): Promise<void> => {
    setCurrentStep(currentStep + 1)
  }

  const handleViewTransaction = (): void => {
    window
      .open(
        `${process.env.REACT_APP_BLOCK_SCAN_URL}/transactions/${signTXhash}`,
        '_blank',
      )
      .focus()
  }

  const enableNextStep = (): boolean => {
    switch (currentStep) {
      case 0:
        return !!bondDescription
      case 1:
        return false
      default:
        return false
    }
  }
  const enablePrevStep = (): boolean => {
    switch (currentStep) {
      case 0:
        return false
      case 1:
        return true
      default:
        return false
    }
  }

  const chooseAnimation = (txStatus): any => {
    switch (txStatus) {
      case TXStatus.PENDING:
        return pendingAnimation
      case TXStatus.SUCCESS:
        return successAnimation
      case TXStatus.ERROR:
        return errorAnimation
      default:
        return ''
    }
  }

  const generateTXMessage = (txStatus: TXStatus): string => {
    switch (txStatus) {
      case TXStatus.PENDING:
        return 'Sign the Transaction'
      case TXStatus.SUCCESS:
        return 'Your transaction was successful!'
      case TXStatus.ERROR:
        return `Something went wrong!\nPlease try again`
      default:
        return ''
    }
  }

  const signInTransaction = (): void => {
    if (!userInfo) {
      Toast.errorToast('Please sign in Keysafe first!')
      return
    }
    const value = {
      bond_did: bondDid,
      token: alphaBondInfo.token.toLowerCase(),
      name: alphaBondInfo.name,
      description: bondDescription,
      function_parameters: [
        {
          param: 'd0',
          value: denomToMinimalDenom(
            //  multiply initial raised
            alphaBondInfo.reserveToken,
            alphaBondInfo.initialSupply,
            undefined,
            18,
          ),
        },
        {
          param: 'p0',
          value: denomToMinimalDenom(
            //  multiply initial price
            alphaBondInfo.reserveToken,
            alphaBondInfo.initialPrice,
            undefined,
            18,
          ),
        },
        {
          param: 'theta',
          value: (alphaBondInfo.initialFundingPool / 100).toFixed(18),
        },
        {
          param: 'kappa',
          value: alphaBondInfo.baseCurveShape.toFixed(18),
        },
      ],
      creator_did: userInfo.didDoc.did,
      controller_did: alphaBondInfo.controllerDid,
      reserve_tokens: [alphaBondInfo.reserveToken],
      tx_fee_percentage: alphaBondInfo.txFeePercentage.toFixed(18),
      exit_fee_percentage: alphaBondInfo.exitFeePercentage.toFixed(18),
      fee_address: alphaBondInfo.feeAddress,
      reserve_withdrawal_address: alphaBondInfo.reserveWithdrawalAddress,
      max_supply: {
        amount: `${alphaBondInfo.maxSupply}`,
        denom: alphaBondInfo.token.toLowerCase(),
      },
      order_quantity_limits: [
        // {
        //   denom: alphaBondInfo.reserveToken,
        //   amount: denomToMinimalDenom(
        //     //  multiply order quantity limits
        //     alphaBondInfo.reserveToken,
        //     alphaBondInfo.orderQuantityLimits,
        //   ),
        // },
      ],
      allow_sells: alphaBondInfo.allowSells,
      allow_reserve_withdrawals: alphaBondInfo.allowReserveWithdrawals,
      outcome_payment: denomToMinimalDenom(
        //  multiply outcome payments
        alphaBondInfo.reserveToken,
        alphaBondInfo.outcomePayment,
      ),
      // defaults
      alpha_bond: true,
      batch_blocks: `1`,
      sanity_rate: '0.000000000000000000',
      sanity_margin_percentage: '0.000000000000000000',
      function_type: 'augmented_function',
    }

    if (!alphaBondInfo.allowSells) {
      unset(value, 'allow_sells')
    }
    if (!alphaBondInfo.allowReserveWithdrawals) {
      unset(value, 'allow_reserve_withdrawals')
    }

    const msg = {
      type: 'bonds/MsgCreateBond',
      value: value,
    }
    // Correct Example
    // const msg = {
    //   type: 'bonds/MsgCreateBond',
    //   value: {
    //     bond_did: bondDid,
    //     token: 'abcdefdfdf',
    //     name: 'A B C',
    //     description: 'desc',
    //     function_parameters: [
    //       {
    //         param: 'd0',
    //         value: '60000000000',
    //       },
    //       {
    //         param: 'p0',
    //         value: '1000000',
    //       },
    //       {
    //         param: 'theta',
    //         value: '0',
    //       },
    //       {
    //         param: 'kappa',
    //         value: '3',
    //       },
    //     ],
    //     creator_did: 'did:sov:CYCc2xaJKrp8Yt947Nc6jd',
    //     controller_did: 'did:sov:CYCc2xaJKrp8Yt947Nc6jd',
    //     reserve_tokens: ['xusd'],
    //     tx_fee_percentage: '0.000000000000000000',
    //     exit_fee_percentage: '0.000000000000000000',
    //     fee_address: 'ixo1tfysxyuc4ql3kpmjrhr7tcy6zt6x8wjgz523qg',
    //     reserve_withdrawal_address:
    //       'ixo1tfysxyuc4ql3kpmjrhr7tcy6zt6x8wjgz523qg',
    //     max_supply: {
    //       amount: '1000000000000',
    //       denom: 'abcdefdfdf',
    //     },
    //     order_quantity_limits: [],
    //     allow_sells: true, //  TODO: where is?
    //     allow_reserve_withdrawals: false,
    //     outcome_payment: '68100000000',
    //     // defaults
    //     alpha_bond: true,
    //     batch_blocks: '1',
    //     sanity_rate: '0.000000000000000000',
    //     sanity_margin_percentage: '0.000000000000000000',
    //     function_type: 'augmented_function',
    //   },
    // }
    const fee = {
      amount: [{ amount: String(5000), denom: 'uixo' }],
      gas: String(200000),
    }

    broadCastMessage(
      userInfo,
      userSequence,
      userAccountNumber,
      [msg],
      '',
      fee,
      (hash) => {
        if (hash) {
          setSignTXStatus(TXStatus.SUCCESS)
          setSignTXhash(hash)
          dispatch(
            updateAlphaBondInfo({
              ...alphaBondInfo,
              bondDid,
            }),
          )
        } else {
          setSignTXStatus(TXStatus.ERROR)
        }
      },
    )
  }

  useEffect(() => {
    if (currentStep === 0) {
      setSignTXStatus(TXStatus.PENDING)
      setSignTXhash(null)
    }
    if (currentStep === 1) {
      // signin.....
      signInTransaction()
    }
    // eslint-disable-next-line
  }, [currentStep])

  return (
    <Container>
      <div className="px-4 pb-4">
        <StepsTransactions
          steps={steps}
          currentStepNo={currentStep}
          handleStepChange={(): void => {
            //
          }}
        />
      </div>

      {currentStep === 0 && (
        <>
          <InfoBox>
            <img src={AlphabondIcon} alt="Name" />
            <span>{alphaBondInfo.name}</span>
          </InfoBox>
          <div className="mt-3" />
          <InfoBox>
            <img src={RingIcon} alt="Token" />
            <span>{alphaBondInfo.token}</span>
          </InfoBox>
          <div className="mt-3" />
          <DescriptionInput
            name="bond_description"
            value={bondDescription}
            onChange={(event: any): void => {
              setBondDescription(event.target.value)
            }}
            placeholder="Description (optional)"
          />
        </>
      )}

      {currentStep === 1 && (
        <TXStatusBoard className="mx-4 d-flex align-items-center flex-column">
          <Lottie
            height={120}
            width={120}
            options={{
              loop: true,
              autoplay: true,
              animationData: chooseAnimation(signTXStatus),
            }}
          />
          <span className="status">{signTXStatus}</span>
          <span className="message">{generateTXMessage(signTXStatus)}</span>
          {signTXStatus === TXStatus.SUCCESS && (
            <div className="transaction mt-3" onClick={handleViewTransaction}>
              <img src={EyeIcon} alt="view transactions" />
            </div>
          )}
        </TXStatusBoard>
      )}

      {enableNextStep() && (
        <NextStep onClick={handleNextStep}>
          <img src={NextStepIcon} alt="next-step" />
        </NextStep>
      )}
      {enablePrevStep() && (
        <PrevStep onClick={handlePrevStep}>
          <img src={NextStepIcon} alt="prev-step" />
        </PrevStep>
      )}
    </Container>
  )
}

export default CreateBondModal

import React from 'react'
import styled from 'styled-components'
import Lottie from 'react-lottie'

import EyeIcon from 'assets/images/eye-icon.svg'
import pendingAnimation from 'assets/animations/transaction/pending.json'
import successAnimation from 'assets/animations/transaction/success.json'
import errorAnimation from 'assets/animations/transaction/fail.json'

const TXStatusBoard = styled.div`
  & > .lottie {
    width: 80px;
  }
  & > .status {
    font-weight: 500;
    font-size: 12px;
    letter-spacing: 0.3px;
    color: #5a879d;
    text-transform: uppercase;
  }
  & > .message {
    font-size: 21px;
    color: #ffffff;
    text-align: center;
  }
  & > .transaction {
    border-radius: 100px;
    border: 1px solid ${(props): string => props.theme.highlight.light};
    padding: 10px 30px;
    cursor: pointer;
  }
`

export enum TXStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
}

interface Props {
  status: TXStatus
  hash: string
}

const SignStep: React.FC<Props> = ({ status, hash }) => {
  function chooseAnimation(status): any {
    switch (status) {
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
  function generateTXMessage(txStatus: TXStatus): string {
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
  function handleViewTransaction(): void {
    window
      .open(
        `${process.env.REACT_APP_BLOCK_SCAN_URL}/transactions/${hash}`,
        '_blank',
      )
      .focus()
  }
  return (
    <TXStatusBoard className="mx-4 d-flex align-items-center flex-column">
      <Lottie
        height={120}
        width={120}
        options={{
          loop: true,
          autoplay: true,
          animationData: chooseAnimation(status),
        }}
      />
      <span className="status">{status}</span>
      <span className="message">{generateTXMessage(status)}</span>
      {status === TXStatus.SUCCESS && (
        <div className="transaction mt-3" onClick={handleViewTransaction}>
          <img src={EyeIcon} alt="view transactions" />
        </div>
      )}
    </TXStatusBoard>
  )
}

export default SignStep

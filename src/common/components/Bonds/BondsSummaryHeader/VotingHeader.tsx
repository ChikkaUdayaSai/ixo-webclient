import React, { Component } from 'react'
import HeaderItem from './SummaryCard/SummaryCard'
import { connect } from 'react-redux'
import { RootState } from '../../../redux/types'
import { getAccount } from '../../../../modules/Account/Account.actions'
import {
  findDenomByMinimalDenom,
  minimalDenomToDenom,
  tokenBalance,
} from '../../../../modules/Account/Account.utils'
import { deviceWidth } from '../../../../lib/commonData'

import styled from 'styled-components'
import { BondStateType } from 'modules/BondModules/bond/types'
import { convertPrice } from 'common/utils/currency.utils'

const StyledHeader = styled.header`
  margin: 1.25rem 0;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  @media (min-width: ${deviceWidth.desktopLarge}px) {
    justify-content: flex-start;
  }
`

interface VotingHeaderState {
  selected: number
}

class VotingHeader extends Component<any, VotingHeaderState> {
  refreshAccount = (): void => {
    if (this.props.account.userInfo) {
      this.props.dispatch(getAccount(this.props.account.address))
    }
  }

  handleClick = (): void => {
    // TODO Add click handler
  }

  componentDidMount(): void {
    this.refreshAccount()
  }

  render(): JSX.Element {
    const { activeBond, selectedHeader, setSelectedHeader, goal, isDark } =
      this.props
    const balance = tokenBalance(this.props.account.balances, activeBond.symbol)
    const {
      state,
      publicAlpha,
      initialRaised,
      symbol,
      myStake,
      reserveDenom,
      alphaHistory,
      outcomePayment,
    } = activeBond

    let fundingTarget = 0
    try {
      fundingTarget = parseInt(goal.replace(/[^0-9]/g, ''))
    } catch (e) {
      fundingTarget = 0
    }

    const currentSupply = minimalDenomToDenom(
      activeBond.myStake.denom,
      activeBond.myStake.amount,
    )

    const myStakeInfo =
      (currentSupply
        ? `${(
            (minimalDenomToDenom(balance.denom, balance.amount) /
              currentSupply) *
            100
          ).toFixed(2)}%`
        : '0%') + ` of ${convertPrice(currentSupply, 2)}`

    const bondCapitalInfo = `${
      fundingTarget
        ? ((activeBond.capital.amount / fundingTarget) * 100).toFixed(2)
        : 0
    }% of Funding Target`

    const reserveInfo = `${(
      (activeBond.reserve.amount / activeBond.capital.amount || 0) * 100
    ).toFixed(2)}% of Capital raise`

    return (
      <StyledHeader>
        <HeaderItem
          tokenType={findDenomByMinimalDenom(reserveDenom)}
          title={`${findDenomByMinimalDenom(reserveDenom)} to Vote`}
          value={minimalDenomToDenom(reserveDenom, activeBond.lastPrice)}
          additionalInfo={`${findDenomByMinimalDenom(
            reserveDenom,
          ).toUpperCase()} per ${activeBond.symbol.toUpperCase()}`}
          priceColor="#39C3E6"
          setActiveHeaderItem={(): void => setSelectedHeader('price')}
          selected={selectedHeader === 'price'}
          to={true}
          isDark={isDark}
        />
        <HeaderItem
          tokenType={balance.denom}
          title="My Share"
          value={balance.amount}
          additionalInfo={myStakeInfo}
          priceColor="#6FCF97"
          setActiveHeaderItem={(): void => setSelectedHeader('stake')}
          selected={selectedHeader === 'stake'}
          to={true}
          isDark={isDark}
        />
        {state !== BondStateType.SETTLED ? (
          <HeaderItem
            tokenType={findDenomByMinimalDenom(reserveDenom)}
            title="My Yield"
            value={activeBond.capital.amount}
            additionalInfo={bondCapitalInfo}
            priceColor="#39C3E6"
            setActiveHeaderItem={this.handleClick}
            selected={selectedHeader === 'raised'}
            to={false}
            isDark={isDark}
          />
        ) : (
          <HeaderItem
            title="Payout"
            value={outcomePayment}
            additionalInfo={' '}
            priceColor="#39C3E6"
            setActiveHeaderItem={this.handleClick}
            selected={selectedHeader === 'raised'}
            to={false}
            isDark={isDark}
          />
        )}
        <HeaderItem
          tokenType={findDenomByMinimalDenom(reserveDenom)}
          title="My Votes"
          value={activeBond.reserve.amount}
          additionalInfo={reserveInfo}
          priceColor="#39C3E6"
          setActiveHeaderItem={(): void => setSelectedHeader('reserve')}
          selected={selectedHeader === 'reserve'}
          to={true}
          isDark={isDark}
        />
        {state === BondStateType.HATCH ? (
          <HeaderItem
            tokenType={symbol}
            title="All Votes"
            value={myStake.amount ? myStake.amount : 0}
            additionalInfo={
              (myStake.amount / initialRaised) * 100 +
              '%' +
              ' of ' +
              initialRaised
            }
            selected={selectedHeader === 'alpha'}
            priceColor="#39C3E6"
            to={false}
            isDark={isDark}
          />
        ) : (
          <HeaderItem
            title="All Votes"
            value={publicAlpha}
            decimals={2}
            additionalInfo={' '}
            selected={selectedHeader === 'alpha'}
            isAlpha={true}
            priceColor="#39C3E6"
            to={alphaHistory.length > 0}
            setActiveHeaderItem={(): void => {
              if (alphaHistory.length > 0) {
                setSelectedHeader('alpha')
              }
            }}
            isDark={isDark}
          />
        )}
      </StyledHeader>
    )
  }
}

const mapStateToProps = function (state: RootState): RootState {
  return state
}

export default connect(mapStateToProps)(VotingHeader)

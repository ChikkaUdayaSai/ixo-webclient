import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import keysafe from 'common/keysafe/keysafe'
import { RootState } from 'common/redux/types'
import AssetStakingCard from 'modules/Entities/EntitiesExplorer/components/EntityCard/AssetCard/AssetStakingCard'
import { TermsOfUseType } from 'modules/Entities/types'
import Tooltip, { TooltipPosition } from 'common/components/Tooltip/Tooltip'
import {
  CardHeader,
  CardBody,
  WalletBox,
  WalletChoosePanel,
  AssetStakingCardPanel,
} from './Trade.container.styles'

import IMG_wallet1 from 'assets/images/exchange/wallet1.svg'
import IMG_wallet2 from 'assets/images/exchange/wallet2.svg'
import IMG_wallet3 from 'assets/images/exchange/wallet3.svg'

import * as keplr from 'common/utils/keplr'
import { setKeplrWallet } from 'modules/Account/Account.actions'
import { useHistory } from 'react-router-dom'
import { changeSelectedAccountAddress } from '../EntityExchange.actions'

const Trade: React.FunctionComponent = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const selectedEntity = useSelector((state: RootState) => state.selectedEntity)
  const { address } = useSelector((state: RootState) => state.account)

  const handleWalletSelected = (walletType: string): void => {
    history.push({
      pathname: `/projects/${selectedEntity.did}/exchange/trade/swap`,
      search: `?wallet=${walletType}`,
    })
  }

  const handleWalletClick = async (walletType: string): Promise<void> => {
    switch (walletType) {
      case 'keysafe': {
        if (address) {
          dispatch(changeSelectedAccountAddress(address))
          handleWalletSelected(walletType)
        } else {
          keysafe.popupKeysafe()
        }
        break
      }
      case 'keplr': {
        const [accounts, offlineSigner] = await keplr.connectAccount()
        if (accounts) {
          dispatch(setKeplrWallet(accounts[0].address, offlineSigner))
          dispatch(changeSelectedAccountAddress(accounts[0].address))
          handleWalletSelected(walletType)
        }
        break
      }
      default:
        break
    }
  }

  const renderAssetStakingCard = (): JSX.Element => (
    <AssetStakingCardPanel>
      <CardHeader>I want</CardHeader>
      <AssetStakingCard
        did={selectedEntity.did}
        name={selectedEntity.name}
        logo={selectedEntity.logo}
        image={selectedEntity.image}
        sdgs={selectedEntity.sdgs}
        description={selectedEntity.description}
        badges={[]}
        version={''}
        termsType={TermsOfUseType.PayPerUse}
        isExplorer={false}
        link={`/projects/${selectedEntity.did}/overview`}
      />
    </AssetStakingCardPanel>
  )

  const renderWalletChoosePanel = (): JSX.Element => (
    <WalletChoosePanel>
      <CardHeader>Connect My Wallet</CardHeader>
      <CardBody>
        <Tooltip text={'Coming soon'} position={TooltipPosition.Bottom}>
          <WalletBox>
            <img src={IMG_wallet1} alt="wallet1" />
            <span>WalletConnect</span>
          </WalletBox>
        </Tooltip>
        <WalletBox onClick={(): Promise<void> => handleWalletClick('keplr')}>
          <img src={IMG_wallet2} alt="wallet2" />
          <span>Keplr</span>
        </WalletBox>
        <WalletBox onClick={(): Promise<void> => handleWalletClick('keysafe')}>
          <img src={IMG_wallet3} alt="wallet3" />
          <span>ixo Keysafe</span>
        </WalletBox>
      </CardBody>
    </WalletChoosePanel>
  )

  return selectedEntity ? (
    <div className="d-flex">
      {renderAssetStakingCard()}
      {renderWalletChoosePanel()}
    </div>
  ) : null
}
export default Trade

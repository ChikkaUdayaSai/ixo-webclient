import * as React from 'react'
import { Fragment } from 'react'
import { deviceWidth } from '../../../../lib/commonData'
import MediaQuery from 'react-responsive'
import { getIxoWorldRoute } from '../../../utils/formatters'
import CreateEntityDropdown from '../../../../modules/Entities/CreateEntity/components/CreateEntityDropdown/CreateEntityDropdown'
import { EntityType } from '../../../../modules/Entities/types'

import {
  Burger,
  Main,
  IXOLogo,
  HeaderLink,
  Menu,
  // MenuHeaderAnchor,
  MenuHeaderContainer,
  MenuHeaderLink,
  MobileMenu,
  NavItems,
  // HeaderAnchor,
} from './HeaderLeft.styles'
import { useSelector } from 'react-redux'
import { selectEntityHeaderUIConfig } from 'modules/Entities/EntitiesExplorer/EntitiesExplorer.selectors'

export interface ParentProps {
  currentEntity: EntityType
  openMenu: boolean
  handleBurgerClick: any
}

export const HeaderLeft: React.FC<ParentProps> = (props) => {
  const headerUIConfig = useSelector(selectEntityHeaderUIConfig)
  const buttonColor = React.useMemo(() => {
    if (!headerUIConfig) {
      return '#49bfe0'
    }
    const { buttonColor } = headerUIConfig
    return buttonColor
  }, [headerUIConfig])

  const getMenuItems = (inHeader: boolean): JSX.Element => {
    if (inHeader) {
      return (
        <Fragment>
          <HeaderLink
            exact={true}
            // to={`/entities/select?type=${props.currentEntity}&sector=all`}
            to={`/`}
            color={buttonColor}
          >
            Explore
          </HeaderLink>
        </Fragment>
      )
    } else {
      return (
        <Fragment>
          <MenuHeaderContainer>
            <MenuHeaderLink
              className="first-mobile"
              exact={true}
              to="/"
              onClick={props.handleBurgerClick}
              color={buttonColor}
            >
              Explore
            </MenuHeaderLink>
          </MenuHeaderContainer>
          <MenuHeaderContainer style={{ background: 'none' }}>
            <CreateEntityDropdown entityType={props.currentEntity} />
          </MenuHeaderContainer>
        </Fragment>
      )
    }
  }
  return (
    <Fragment>
      <Main className="col-md-12 col-lg-8 d-flex align-items-center">
        <div>
          <a href={getIxoWorldRoute('')}>
            <IXOLogo
              alt="IXO Logo"
              src={require('../../../../assets/images/ixo-logo.svg')}
            />
          </a>
        </div>
        <NavItems>
          <Burger onClick={props.handleBurgerClick}>
            <div className={props.openMenu === true ? 'change' : ''}>
              <div className="bar1" />
              <div className="bar2" />
              <div className="bar3" />
            </div>
          </Burger>
          <MediaQuery minWidth={`${deviceWidth.desktop}px`}>
            <Menu>{getMenuItems(true)}</Menu>
          </MediaQuery>
        </NavItems>
      </Main>
      <MediaQuery maxWidth={'991px'}>
        <MobileMenu className={props.openMenu === true ? 'openMenu' : ''}>
          {getMenuItems(false)}
        </MobileMenu>
      </MediaQuery>
    </Fragment>
  )
}

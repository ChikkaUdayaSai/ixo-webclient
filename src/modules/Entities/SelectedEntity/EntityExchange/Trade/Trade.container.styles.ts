import styled from 'styled-components'

export const AssetStakingCardPanel = styled.div`
  width: 300px;
  margin-right: 70px;
`

export const WalletChoosePanel = styled.div`
  width: 370px;
`

export const CardHeader = styled.span`
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 41px;
  display: flex;
  align-items: center;
  color: #ffffff;

  & > span {
    color: ${(props): string => props.theme.ixoBlue};
  }
`

export const CardBody = styled.div`
  background: linear-gradient(180deg, #01273a 0%, #002d42 100%);
  border: 1px solid #083347;
  box-sizing: border-box;
  box-shadow: -1px 10px 30px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  color: white;
  padding: 10px;
  position: relative;
`
export const WalletBox = styled.div`
  background: linear-gradient(180deg, #01273a 0%, #002d42 100%);
  border: 1px solid #083347;
  box-sizing: border-box;
  box-shadow: -1px 10px 30px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  margin: 10px;
  padding: 10px;
  cursor: pointer;

  & > img {
    border-radius: 50%;
    width: 40px;
    height: 40px;
  }

  & > span {
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    padding-left: 20px;
  }
`

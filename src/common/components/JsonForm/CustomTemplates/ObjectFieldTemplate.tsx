import React, { useMemo } from 'react'

export const ObjectFieldTemplate2Column: React.FunctionComponent = (
  props: any,
) => {
  const totalRows = Math.ceil(props.properties.length / 2)
  const rowArray = new Array(totalRows).fill(null)

  return (
    <>
      {props.title}
      {props.description}
      {rowArray.map((v, i) => {
        const property1 = props.properties[i * 2]
        const property2 = props.properties[i * 2 + 1]

        return (
          <div key={i} className="form-row">
            <div key={property1.id} className="col-lg-6">
              {property1.content}
            </div>
            {property2 && (
              <div key={property2.id} className="col-lg-6">
                {property2.content}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

export const ObjectFieldTokenTemplateColumn: React.FunctionComponent = (
  props: any,
) => {
  return (
    <>
      {props.title}
      {props.description}
      <div className="form-row">
        <div className="col-lg-6">
          {props.properties.find((prop) => prop.name === 'templateId')?.content}
        </div>
        <div className="col-lg-6">
          {props.properties.find((prop) => prop.name === 'name')?.content}
          {props.properties.find((prop) => prop.name === 'collection')?.content}
          <div className="form-row">
            <div className="col-lg-6">
              {props.properties.find((prop) => prop.name === 'denom')?.content}
            </div>
            <div className="col-lg-6">
              {
                props.properties.find((prop) => prop.name === 'quantity')
                  ?.content
              }
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export const ObjectFieldLinkedResourcesColumn: React.FunctionComponent = (
  props: any,
) => {
  return (
    <>
      {props.title}
      {props.description}
      <div className="form-row">
        <div className="col-lg-6">
          {props.properties.find((prop) => prop.name === 'file')?.content}
        </div>
        <div className="col-lg-6">
          {props.properties.find((prop) => prop.name === 'name')?.content}
          {props.properties.find((prop) => prop.name === 'path')?.content}
          {props.properties.find((prop) => prop.name === 'type')?.content}
          {
            props.properties.find((prop) => prop.name === 'description')
              ?.content
          }
        </div>
      </div>
    </>
  )
}

export const ObjectFieldConfigureAlphaBondColumn: React.FunctionComponent = (
  props: any,
) => {
  const properties = useMemo(() => props.properties, [props])
  const formData = useMemo(() => props.formData, [props])

  const baseBondingCurve = useMemo(
    () => properties.find((item) => item.name === 'baseBondingCurve'),
    [properties],
  )
  const token = useMemo(
    () => properties.find((item) => item.name === 'token'),
    [properties],
  )
  const name = useMemo(
    () => properties.find((item) => item.name === 'name'),
    [properties],
  )
  const controllerDid = useMemo(
    () => properties.find((item) => item.name === 'controllerDid'),
    [properties],
  )
  const reserveToken = useMemo(
    () => properties.find((item) => item.name === 'reserveToken'),
    [properties],
  )
  const txFeePercentage = useMemo(
    () => properties.find((item) => item.name === 'txFeePercentage'),
    [properties],
  )
  const exitFeePercentage = useMemo(
    () => properties.find((item) => item.name === 'exitFeePercentage'),
    [properties],
  )
  const feeAddress = useMemo(
    () => properties.find((item) => item.name === 'feeAddress'),
    [properties],
  )
  const reserveWithdrawalAddress = useMemo(
    () => properties.find((item) => item.name === 'reserveWithdrawalAddress'),
    [properties],
  )
  const maxSupply = useMemo(
    () => properties.find((item) => item.name === 'maxSupply'),
    [properties],
  )
  const initialPrice = useMemo(
    () => properties.find((item) => item.name === 'initialPrice'),
    [properties],
  )
  const initialFundingPool = useMemo(
    () => properties.find((item) => item.name === 'initialFundingPool'),
    [properties],
  )
  const initialSupply = useMemo(
    () => properties.find((item) => item.name === 'initialSupply'),
    [properties],
  )
  const baseCurveShape = useMemo(
    () => properties.find((item) => item.name === 'baseCurveShape'),
    [properties],
  )
  const orderQuantityLimits = useMemo(
    () => properties.find((item) => item.name === 'orderQuantityLimits'),
    [properties],
  )
  const allowSells = useMemo(
    () => properties.find((item) => item.name === 'allowSells'),
    [properties],
  )
  const allowReserveWithdrawals = useMemo(
    () => properties.find((item) => item.name === 'allowReserveWithdrawals'),
    [properties],
  )
  const outcomePayment = useMemo(
    () => properties.find((item) => item.name === 'outcomePayment'),
    [properties],
  )
  const bondDid = useMemo(
    () => properties.find((item) => item.name === 'bondDid'),
    [properties],
  )

  return (
    <>
      {props.title}
      {props.description}
      <div className="row">
        <div className="col-lg-6">
          {baseBondingCurve && baseBondingCurve.content}
        </div>
        <div className="col-lg-6">
          <div className="d-flex flex-column">
            {name && name.content}
            {controllerDid && controllerDid.content}
            <div className="row">
              <div className="col-6">{token && token.content}</div>
              <div className="col-6">
                {reserveToken && reserveToken.content}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6">
          <div className="row">
            <div className="col-6">
              {baseCurveShape && baseCurveShape.content}
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="row">
            <div className="col-6">
              {initialSupply && initialSupply.content}
            </div>
            <div className="col-6">{maxSupply && maxSupply.content}</div>
          </div>
        </div>
        <div className="col-lg-6">{feeAddress && feeAddress.content}</div>
        <div className="col-lg-6">
          <div className="row">
            <div className="col-lg-6">
              {initialPrice && initialPrice.content}{' '}
            </div>
            <div className="col-lg-6">
              {formData.allowSells &&
                initialFundingPool &&
                initialFundingPool.content}
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="row">
            <div className="col-6">
              {txFeePercentage && txFeePercentage.content}
            </div>
            <div className="col-6">
              {exitFeePercentage && exitFeePercentage.content}
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="row">
            <div className="col-6">
              {formData.allowReserveWithdrawals &&
                reserveWithdrawalAddress &&
                reserveWithdrawalAddress.content}
            </div>
            <div className="col-6">
              {allowReserveWithdrawals && allowReserveWithdrawals.content}
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="row">
            <div className="col-6">
              {outcomePayment && outcomePayment.content}
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="row">
            <div className="col-6">
              {formData.allowSells &&
                orderQuantityLimits &&
                orderQuantityLimits.content}
            </div>
            <div className="col-6">{allowSells && allowSells.content}</div>
          </div>
        </div>
      </div>
      {!!formData.bondDid && (
        <div className="row">
          <div className="col-6 offset-md-6">{bondDid && bondDid.content}</div>
        </div>
      )}
    </>
  )
}

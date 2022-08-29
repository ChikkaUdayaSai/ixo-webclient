export async function getAuthAccount(address: string): Promise<any> {
  let fetchResult
  try {
    fetchResult = await fetch(
      `${process.env.REACT_APP_GAIA_URL}/cosmos/auth/v1beta1/accounts/${address}`,
    )
  } catch (error) {
    console.log('ixohelper.getAuthAccountsJSON.fetchResult.error', error)
  }
  const authAccountsJSON = await fetchResult.json()
  console.log('ixohelper.authAccountsJSON', authAccountsJSON)
  return {
    accountNumber: authAccountsJSON.account.account_number,
    sequence: authAccountsJSON.account.sequence,
  }
}

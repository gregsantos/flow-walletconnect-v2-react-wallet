/**
 * Types
 */
interface IInitArgs {
  address?: string
}

interface Wallet {
  address: string
  keyId: number
  keys: string[]
}

/**
 * Library
 */
export default class FlowLib {
  wallet: Wallet

  constructor(wallet: Wallet) {
    this.wallet = wallet
  }

  static init({ address }: IInitArgs) {
    const wallet = address
      ? {
          address: address,
          keyId: 0,
          keys: ['268d99bb71f7402427cf0e3faafc0f078043708d8a47ddeb59296794f78b617e']
        }
      : {
          address: '0xf8d6e0586b0a20c7',
          keyId: 0,
          keys: ['f8e188e8af0b8b414be59c4a1a15cc666c898fb34d94156e9b51e18bfde754a5']
        }

    return new FlowLib(wallet)
  }

  getAddress() {
    return this.wallet.address
  }

  public getPrivateKey() {
    return this.wallet.keys[0].toString()
  }

  public async authn(message: string) {
    const signature = ''
    const bs58Signature = ''

    return { signature: bs58Signature }
  }

  public async authz(message: string) {
    const signature = ''
    const bs58Signature = ''

    return { signature: bs58Signature }
  }

  public async userSign(message: string) {
    const signature = ''
    const bs58Signature = ''

    return { signature: bs58Signature }
  }
}

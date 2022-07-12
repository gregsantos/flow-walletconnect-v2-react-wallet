import FlowLib from '@/lib/FlowLib'

export let wallet1: FlowLib
export let wallet2: FlowLib
export let flowWallets: Record<string, FlowLib>
export let flowAddresses: string[]

let address1: string
let address2: string

/**
 * Utilities
 */
export function createOrRestoreFlowWallet() {
  wallet1 = FlowLib.init({})
  wallet2 = FlowLib.init({ address: '0x6a52c92a9d46ce15' })

  address1 = wallet1.getAddress()
  address2 = wallet2.getAddress()

  flowWallets = {
    [address1]: wallet1,
    [address2]: wallet2
  }
  flowAddresses = Object.keys(flowWallets)

  return {
    flowWallets,
    flowAddresses
  }
}

/**
 * Types
 */
export type TFlowChain = keyof typeof FLOW_CHAINS

/**
 * Chains
 */
export const FLOW_TEST_CHAINS = {
  'flow:testnet': {
    chainId: 'testnet',
    name: 'Flow Testnet',
    logo: 'https://avatars.githubusercontent.com/u/62387156?s=280&v=4',
    rgb: '2, 239, 139',
    rpc: 'https://rest-testnet.onflow.org'
  }
}

export const FLOW_MAINNET_CHAINS = {
  'flow:mainnet': {
    chainId: 'mainnet',
    name: 'Flow Mainnet',
    logo: 'https://avatars.githubusercontent.com/u/62387156?s=280&v=4',
    rgb: '2, 239, 139',
    rpc: 'https://rest-mainnet.onflow.org'
  }
}

export const FLOW_CHAINS = { ...FLOW_MAINNET_CHAINS, ...FLOW_TEST_CHAINS }

/**
 * Methods
 */
export const FLOW_SIGNING_METHODS = {
  FLOW_AUTHN: 'flow_authn',
  FLOW_AUTHZ: 'flow_authz',
  FLOW_USER_SIGN: 'flow_user_sign'
}

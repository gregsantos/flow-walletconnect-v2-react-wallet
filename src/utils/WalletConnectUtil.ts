import SignClient from '@walletconnect/sign-client'

export let signClient: SignClient

export async function createSignClient() {
  signClient = await SignClient.init({
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    relayUrl: process.env.NEXT_PUBLIC_RELAY_URL ?? 'wss://relay.walletconnect.com',
    metadata: {
      name: 'FCL/WC React Wallet',
      description: 'React Wallet for FCL WalletConnect',
      url: 'https://flow-walletconnect-v2-react-wallet.vercel.app',
      icons: ['https://avatars.githubusercontent.com/u/37784886']
    }
  })
}

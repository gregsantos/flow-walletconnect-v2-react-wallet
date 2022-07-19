import { FLOW_SIGNING_METHODS } from '@/data/FlowData'
import { flowWallets, flowAddresses } from '@/utils/FlowWalletUtil'
import { getWalletAddressFromParams } from '@/utils/HelperUtil'
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils'
import { SignClientTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'
import { WalletUtils } from '@onflow/fcl'
import { sign } from '@/utils/crypto'

const getServices = (address: string) => [
  {
    f_type: 'Service',
    f_vsn: '1.0.0',
    type: 'authn',
    uid: 'fcl-wc#authn',
    endpoint: 'flow_authn',
    id: address,
    identity: {
      address: address
    },
    provider: {
      address: null,
      name: 'Flow WC Wallet',
      icon: null,
      description: 'A Flow enabled WC Wallet'
    }
  },
  {
    f_type: 'Service',
    f_vsn: '1.0.0',
    type: 'authz',
    uid: 'fcl-wc#authz',
    endpoint: 'flow_authz',
    method: 'WC/RPC',
    identity: {
      address: address,
      keyId: 0
    }
  }
]

export async function approveFlowRequest(
  requestEvent: SignClientTypes.EventArguments['session_request']
) {
  const { params, id } = requestEvent
  const { request } = params
  const {
    method,
    params: { addr, keyId, message }
  } = request
  // const wallet = flowWallets[getWalletAddressFromParams(flowAddresses, params)]
  const privKey = '268d99bb71f7402427cf0e3faafc0f078043708d8a47ddeb59296794f78b617e'
  const services = getServices(addr)

  switch (request.method) {
    case FLOW_SIGNING_METHODS.FLOW_AUTHN:
      return formatJsonRpcResult(id, {
        f_type: 'PollingResponse',
        f_vsn: '1.0.0',
        status: 'APPROVED',
        reason: null,
        data: {
          f_type: 'AuthnResponse',
          f_vsn: '1.0.0',
          addr,
          services
        }
      })

    case FLOW_SIGNING_METHODS.FLOW_AUTHZ:
      const signature = sign(privKey, message)

      const compSig = new WalletUtils.CompositeSignature(addr, keyId, signature)
      return formatJsonRpcResult(id, {
        f_type: 'PollingResponse',
        f_vsn: '1.0.0',
        type: 'FCL:VIEW:RESPONSE',
        status: 'APPROVED',
        reason: null,
        data: compSig
      })
    /*
    case FLOW_SIGNING_METHODS.FLOW_USER_SIGN:
      const userSign = await wallet.userSign(params.signerAddress)
      return formatJsonRpcResult(id, userSign.signature)  
*/

    default:
      throw new Error(getSdkError('UNSUPPORTED_METHODS').message)
  }
}

export function rejectFlowRequest(request: SignClientTypes.EventArguments['session_request']) {
  const { id } = request

  return formatJsonRpcError(id, getSdkError('USER_REJECTED_METHODS').message)
}

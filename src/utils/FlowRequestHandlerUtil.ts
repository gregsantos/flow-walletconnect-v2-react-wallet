import { FLOW_SIGNING_METHODS } from '@/data/FlowData'
import { flowWallets, flowAddresses } from '@/utils/FlowWalletUtil'
import { getWalletAddressFromParams } from '@/utils/HelperUtil'
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils'
import { SignClientTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'

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
  const wallet = flowWallets[getWalletAddressFromParams(flowAddresses, params)]
  const privKey = 'f8e188e8af0b8b414be59c4a1a15cc666c898fb34d94156e9b51e18bfde754a5'
  const services = getServices('0xf8d6e0586b0a20c7')

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
          addr: '0xf8d6e0586b0a20c7',
          services
        }
      })

    /*  case FLOW_SIGNING_METHODS.FLOW_AUTHZ:
      const message = params[0].message
      const signature = sign(privKey, message)

      const compSig = new WalletUtils.CompositeSignature('f8d6e0586b0a20c7', 0, signature)
      return formatJsonRpcResult(id, {
        f_type: 'PollingResponse',
        f_vsn: '1.0.0',
        type: 'FCL:VIEW:RESPONSE',
        status: 'APPROVED',
        reason: null,
        data: compSig
      })

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

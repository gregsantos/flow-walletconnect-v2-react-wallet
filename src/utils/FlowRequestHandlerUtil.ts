import { FLOW_SIGNING_METHODS } from '@/data/FlowData'
import { flowWallets, flowAddresses } from '@/utils/FlowWalletUtil'
import { getWalletAddressFromParams } from '@/utils/HelperUtil'
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils'
import { SignClientTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'
import { WalletUtils, withPrefix } from '@onflow/fcl'
import { sign, signUserMessage } from '@/utils/crypto'

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
    type: 'pre-authz',
    uid: 'fcl-wc#pre-authz',
    method: 'WC/RPC',
    endpoint: 'flow_pre_authz',
    params: {
      sessionId: 'XvBji8zSj-YYb3Mc8YIw'
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
    },
    params: {
      sessionId: 'Zu1HvYJIQ-9NEC6Qo5r8'
    }
  },
  {
    f_type: 'Service',
    f_vsn: '1.0.0',
    type: 'user-signature',
    uid: 'fcl-wc#user_sign',
    endpoint: 'flow_user_sign',
    method: 'WC/RPC',
    id: address,
    identity: {
      address: address,
      keyId: 0
    },
    data: { addr: address, keyId: 0 },
    params: {}
  }
]

export async function approveFlowRequest(
  requestEvent: SignClientTypes.EventArguments['session_request']
) {
  const { params, id } = requestEvent
  const { chainId, request } = params
  const paramsAsJSON = JSON.parse(request.params)
  const { addr, keyId, message, data } = paramsAsJSON
  const services = getServices(withPrefix(addr))
  const wallet = flowWallets[getWalletAddressFromParams(flowAddresses, params)] // flowWallets[withPrefix(addr)]
  const keyIndex = keyId || data?.keyId || 0
  const privKey = wallet.getPrivateKey(keyIndex)

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
          addr: withPrefix(addr),
          services
        }
      })

    case FLOW_SIGNING_METHODS.FLOW_PRE_AUTHZ:
      return formatJsonRpcResult(id, {
        f_type: 'PollingResponse',
        f_vsn: '1.0.0',
        status: 'APPROVED',
        data: {
          f_type: 'PreAuthzResponse',
          f_vsn: '1.0.0',
          proposer: {
            // A single Authz Service
            f_type: 'Service',
            f_vsn: '1.0.0',
            type: 'authz', // say it's an authorization service
            uid: 'fcl-wc#preauthz', // standard service uid
            method: 'WC/RPC', // can also be `IFRAME/RPC` or `POP/RPC`
            endpoint: 'flow_authz', // where to talk to the service
            identity: {
              f_type: 'Identity',
              f_vsn: '1.0.0',
              address: '0x6a52c92a9d46ce15',
              keyId: 0
            },
            data: {},
            params: {
              sessionId: 'Zu1HvYJIQ-9NEC6Qo5r8'
            }
          },
          payer: [
            // An array of Authz Services
            {
              f_type: 'Service',
              f_vsn: '1.0.0',
              type: 'authz', // say it's an authorization service
              uid: 'fcl-wc#preauthz', // standard service uid
              method: 'WC/RPC', // can also be `IFRAME/RPC` or `POP/RPC`
              endpoint: 'flow_authz', // where to talk to the service
              identity: {
                f_type: 'Identity',
                f_vsn: '1.0.0',
                address: '0x6a52c92a9d46ce15',
                keyId: 0
              },
              data: {},
              params: {
                sessionId: 'Zu1HvYJIQ-9NEC6Qo5r8'
              }
            }
          ],
          authorization: [
            // An array of Authz Services (it's singular because it only represents a singular authorization)
            {
              // A single Authz Service
              f_type: 'Service',
              f_vsn: '1.0.0',
              type: 'authz', // say it's an authorization service
              uid: 'fcl-wc#preauthz', // standard service uid
              method: 'WC/RPC', // can also be `IFRAME/RPC` or `POP/RPC`
              endpoint: 'flow_authz', // where to talk to the service
              identity: {
                f_type: 'Identity',
                f_vsn: '1.0.0',
                address: '0x6a52c92a9d46ce15',
                keyId: 0
              },
              data: {},
              params: {
                sessionId: 'Zu1HvYJIQ-9NEC6Qo5r8'
              }
            }
          ]
        }
      })

    case FLOW_SIGNING_METHODS.FLOW_AUTHZ:
      const signature = sign(privKey, message)
      const compSig = new WalletUtils.CompositeSignature(addr, keyId, signature)

      return formatJsonRpcResult(id, {
        f_type: 'PreAuthzResponse',
        f_vsn: '1.0.0',
        type: 'FCL:VIEW:RESPONSE',
        status: 'APPROVED',
        reason: null,
        data: compSig
      })

    case FLOW_SIGNING_METHODS.FLOW_USER_SIGN:
      const compositeSignature = await signUserMessage(
        { addr, keyId: data.keyId, message },
        privKey
      )

      return formatJsonRpcResult(id, {
        f_type: 'PollingResponse',
        f_vsn: '1.0.0',
        type: 'null',
        status: 'APPROVED',
        reason: null,
        data: compositeSignature
      })

    default:
      throw new Error(getSdkError('INVALID_METHOD').message)
  }
}

export function rejectFlowRequest(request: SignClientTypes.EventArguments['session_request']) {
  const { id } = request
  const fclResponse = {
    f_type: 'PollingResponse',
    f_vsn: '1.0.0',
    status: 'DECLINED',
    reason: "User didn't approve",
    data: formatJsonRpcError(id, getSdkError('USER_REJECTED_METHODS').message)
  }

  return formatJsonRpcResult(id, fclResponse)
}

import { FLOW_SIGNING_METHODS } from '@/data/FlowData'
import ModalStore from '@/store/ModalStore'
import { signClient } from '@/utils/WalletConnectUtil'
import { SignClientTypes } from '@walletconnect/types'
import { useCallback, useEffect } from 'react'
import { approveFlowRequest } from '@/utils/FlowRequestHandlerUtil'

export default function useWalletConnectEventsManager(initialized: boolean) {
  /******************************************************************************
   * 1. Open session proposal modal for confirmation / rejection
   *****************************************************************************/
  const onSessionProposal = useCallback(
    (proposal: SignClientTypes.EventArguments['session_proposal']) => {
      ModalStore.open('SessionProposalModal', { proposal })
    },
    []
  )

  /******************************************************************************
   * 2. [Optional] handle session created
   *****************************************************************************/
  const onSessionCreated = useCallback((created: 'session_update') => {}, [])

  /******************************************************************************
   * 3. Open request handling modal based on method that was used
   *****************************************************************************/
  const onSessionRequest = useCallback(
    async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
      const { topic, params } = requestEvent
      const { request } = params
      const requestSession = signClient.session.get(topic)

      switch (request.method) {
        case FLOW_SIGNING_METHODS.FLOW_AUTHN:
          if (requestEvent) {
            const response = await approveFlowRequest(requestEvent)
            await signClient.respond({
              topic: requestEvent.topic,
              response
            })
          }
          break

        case FLOW_SIGNING_METHODS.FLOW_AUTHZ:
        case FLOW_SIGNING_METHODS.FLOW_USER_SIGN:
          return ModalStore.open('SessionSignFlowModal', {
            requestEvent,
            requestSession
          })

        default:
          return ModalStore.open('SessionUnsuportedMethodModal', { requestEvent, requestSession })
      }
    },
    []
  )

  /******************************************************************************
   * Set up WalletConnect event listeners
   *****************************************************************************/
  useEffect(() => {
    if (initialized) {
      signClient.on('session_proposal', onSessionProposal)
      signClient.on('session_request', onSessionRequest)
      // TODOs
      signClient.on('session_ping', data => console.log('ping', data))
      signClient.on('session_event', data => console.log('event', data))
      signClient.on('session_update', data => console.log('update', data))
      signClient.on('session_delete', data => console.log('delete', data))
    }
  }, [initialized, onSessionProposal, onSessionRequest])
}

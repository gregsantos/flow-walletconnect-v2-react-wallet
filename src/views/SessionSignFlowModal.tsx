import ProjectInfoCard from '@/components/ProjectInfoCard'
import RequestDataCard from '@/components/RequestDataCard'
import RequesDetailsCard from '@/components/RequestDetalilsCard'
import RequestMethodCard from '@/components/RequestMethodCard'
import RequestModalContainer from '@/components/RequestModalContainer'
import ModalStore from '@/store/ModalStore'
import { signClient } from '@/utils/WalletConnectUtil'
import { Button, Divider, Modal, Text } from '@nextui-org/react'
import { Fragment } from 'react'
import { approveFlowRequest, rejectFlowRequest } from '@/utils/FlowRequestHandlerUtil'

export default function SessionSignFlowModal() {
  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent
  const requestSession = ModalStore.state.data?.requestSession

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Text>Missing request data</Text>
  }

  // Get required request data
  const { topic, params } = requestEvent
  const { chainId, request } = params

  type ReduceReturnType = {
    addr?: string
    keyId?: number
    cadence?: string
    args?: any
  }
  const JSONparams = JSON.parse(request.params[0])

  const allowed = ['addr', 'keyId', 'cadence', 'args', 'message']
  const filtered = Object.keys(JSONparams)
    .filter(key => allowed.includes(key))
    .reduce((obj, key) => {
      // @ts-ignore
      obj[key] = JSONparams[key]
      return obj
    }, {})
  const JSONcadence = request.params[0].cadence

  // Handle approve action (logic varies based on request method)
  async function onApprove() {
    if (requestEvent) {
      const response = await approveFlowRequest(requestEvent)
      await signClient.respond({
        topic,
        response
      })
      ModalStore.close()
    }
  }

  // Handle reject action
  async function onReject() {
    if (requestEvent) {
      const response = rejectFlowRequest(requestEvent)
      await signClient.respond({
        topic,
        response
      })
      ModalStore.close()
    }
  }

  return (
    <Fragment>
      <RequestModalContainer title="Sign Message">
        <ProjectInfoCard metadata={requestSession.peer.metadata} />

        <Divider y={2} />

        <RequesDetailsCard chains={[chainId ?? '']} protocol={requestSession.relay.protocol} />

        <Divider y={2} />

        <RequestDataCard
          data={{
            chainId,
            method: request.method,
            ...filtered
          }}
        />

        <Divider y={2} />

        <RequestMethodCard methods={[request.method]} />
      </RequestModalContainer>

      <Modal.Footer>
        <Button auto flat color="error" onClick={onReject}>
          Reject
        </Button>
        <Button auto flat color="success" onClick={onApprove}>
          Approve
        </Button>
      </Modal.Footer>
    </Fragment>
  )
}

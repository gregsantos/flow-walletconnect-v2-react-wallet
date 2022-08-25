import ModalStore from '@/store/ModalStore'
import SessionSignFlowModal from '@/views/SessionSignFlowModal'
import SessionProposalModal from '@/views/SessionProposalModal'
import SessionUnsuportedMethodModal from '@/views/SessionUnsuportedMethodModal'
import { Modal as NextModal } from '@nextui-org/react'
import { useSnapshot } from 'valtio'

export default function Modal() {
  const { open, view } = useSnapshot(ModalStore.state)

  return (
    <NextModal blur open={open} style={{ border: '1px solid rgba(139, 139, 139, 0.4)' }}>
      {view === 'SessionProposalModal' && <SessionProposalModal />}
      {view === 'SessionUnsuportedMethodModal' && <SessionUnsuportedMethodModal />}
      {view === 'SessionSignFlowModal' && <SessionSignFlowModal />}
    </NextModal>
  )
}

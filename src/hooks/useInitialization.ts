import SettingsStore from '@/store/SettingsStore'
import { createOrRestoreFlowWallet } from '@/utils/FlowWalletUtil'
import { createSignClient } from '@/utils/WalletConnectUtil'
import { useCallback, useEffect, useState } from 'react'

export default function useInitialization() {
  const [initialized, setInitialized] = useState(false)

  const onInitialize = useCallback(async () => {
    try {
      const { flowAddresses } = await createOrRestoreFlowWallet()
      SettingsStore.setFlowAddress(flowAddresses[0])

      await createSignClient()

      setInitialized(true)
    } catch (err: unknown) {
      alert(err)
    }
  }, [])

  useEffect(() => {
    if (!initialized) {
      onInitialize()
    }
  }, [initialized, onInitialize])

  return initialized
}

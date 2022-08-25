import AccountCard from '@/components/AccountCard'
import AccountPicker from '@/components/AccountPicker'
import PageHeader from '@/components/PageHeader'
import { FLOW_TEST_CHAINS, FLOW_MAINNET_CHAINS } from '@/data/FlowData'
import SettingsStore from '@/store/SettingsStore'
import { Text } from '@nextui-org/react'
import { Fragment } from 'react'
import { useSnapshot } from 'valtio'

export default function HomePage() {
  const { testNets, flowAddress } = useSnapshot(SettingsStore.state)

  return (
    <Fragment>
      <PageHeader title="Accounts">
        <AccountPicker />
      </PageHeader>
      <Text h4 css={{ marginBottom: '$5' }}>
        Mainnets
      </Text>
      {Object.values(FLOW_MAINNET_CHAINS).map(({ name, logo, rgb }) => (
        <AccountCard key={name} name={name} logo={logo} rgb={rgb} address={flowAddress} />
      ))}

      {testNets ? (
        <Fragment>
          <Text h4 css={{ marginBottom: '$5' }}>
            Testnets
          </Text>
          {Object.values(FLOW_TEST_CHAINS).map(({ name, logo, rgb }) => (
            <AccountCard key={name} name={name} logo={logo} rgb={rgb} address={flowAddress} />
          ))}
        </Fragment>
      ) : null}
    </Fragment>
  )
}

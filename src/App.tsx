import { useState } from 'react'
import { Graph } from './components/Graph'
import Button from './components/Button'
import logo from './assets/logo.png'

export type Selection = [string | null, string | null, string | null]

export default function App() {
  const [selected, setSelected] = useState<Selection>([null, null, null])
  const [stopId, setStopId] = useState('A06')

  return (
    <div className="flex min-h-screen flex-col overflow-visible bg-[url('./assets/background.png')] bg-cover pb-32">
      <div className="flex justify-center pt-15 pb-0">
        <img src={logo} alt="Logo" className="w-120 sm:w-200 md:w-4xl lg:w-250" />
      </div>
      <div className="relative z-40 mb-5">
        <Button selected={selected} onChange={setSelected} />
      </div>
      <Graph
        selected={selected}
        stopId={stopId}
        onStopChange={setStopId}
      />
    </div>
  )
}

import { useState } from 'react'
import { Graph } from './components/Graph'
import Button from './components/Button'
import logo from './assets/logo.png'

export type Selection = [string | null, string | null, string | null]
export type Line = 'A' | 'B'

export default function App() {
  const [selected, setSelected] = useState<Selection>([null, null, null])
  const [line, setLine] = useState<Line>('A')

  return (
    <div className="flex flex-col min-h-screen bg-[url('./assets/background.png')] bg-cover">
      <div className="flex justify-center pt-15 pb-0">
        <img src={logo} alt="Logo" className="w-120 sm:w-200 md:w-4xl lg:w-250" />
      </div>
      <div className="mb-5">
        <Button selected={selected} onChange={setSelected} />
      </div>
      <Graph selected={selected} line={line} onLineChange={setLine} />
    </div>
  )
}

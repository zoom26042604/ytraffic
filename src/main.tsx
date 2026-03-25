import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './globals.css'
import { Graph } from './components/Graph'
import Button from './components/Button'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="flex flex-col min-h-screen bg-[url('./assets/background.png')] bg-cover">
      <Button/>
      <Graph/>
    </div>
  </StrictMode>
)

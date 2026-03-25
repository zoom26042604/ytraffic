import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './globals.css'
import { Graph } from './components/Graph'
import Button from './components/Button'
import logo from './assets/logo.png'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="flex flex-col min-h-screen bg-[url('./assets/background.png')] bg-cover">
      <div className="flex justify-center pt-15 pb-0">
        <img src={logo} alt="Logo" className="w-120 sm:w-200 md:w-4xl lg:w-250" />
      </div>
      <div className="mb-5">
        <Button/>
      </div>
      <Graph/>
    </div>
  </StrictMode>
)

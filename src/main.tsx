import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './globals.css'
import { Graph } from './components/Graph'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Graph/>
import Button from './components/button'
import './globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Button ></Button>
  </StrictMode>,
)

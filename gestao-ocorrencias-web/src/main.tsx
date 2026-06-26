import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // <-- ESTA LINHA É A PONTE PARA O TAILWIND
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppWrapper } from './AppWrapper.tsx'
import './index.css'
import { installFetchInterceptor } from './utils/fetchInterceptor'

// Install global fetch interceptor to add JWT auth to ALL API calls
installFetchInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
)

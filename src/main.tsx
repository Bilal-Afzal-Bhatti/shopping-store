import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// 1. Import the Provider from the library
import { GoogleOAuthProvider } from '@react-oauth/google'

// Replace this string with your real Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID_GOES_HERE.apps.googleusercontent.com";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 2. Wrap App with the Google Provider */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
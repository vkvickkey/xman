import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

import { MusicProvider } from './context/MusicContext.jsx'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <MusicProvider>
      <App />
      <Toaster position="top-center" />
    </MusicProvider>
  </BrowserRouter>
)

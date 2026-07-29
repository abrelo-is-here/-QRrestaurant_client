import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from '../lib/AuthContext.jsx'
import { ToastContainer } from 'react-toastify';
import { ThemeProvider } from "../lib/ThemeContext.jsx";
import { CurrencyProvider } from '../lib/Currency.jsx';

createRoot(document.getElementById('root')).render(
  <ThemeProvider>
  <AuthProvider>
    <CurrencyProvider >
      <App />
    </CurrencyProvider>
    <ToastContainer />
  </AuthProvider>
  </ThemeProvider>
)

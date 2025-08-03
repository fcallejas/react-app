// File: src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider as AppConfigProvider } from './config/ConfigContext';
import ConfigGate from './config/ConfigGate';
import 'antd/dist/reset.css';

const queryClient = new QueryClient();

function Root() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AppConfigProvider>
            <ConfigGate>
              <App />
            </ConfigGate>
          </AppConfigProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);

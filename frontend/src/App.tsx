import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { ThemeProvider } from '@contexts/ThemeContext';
import { router } from '@routes/index';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </ThemeProvider>
  );
};

export default App;

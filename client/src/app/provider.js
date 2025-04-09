'use client';

import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import { store } from './redux';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';



export const persistor = persistStore(store);

export default function Provider({ children }) {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={false} persistor={persistor}>
        <Header />
        {children}
        <Toaster position="top-center" />
      </PersistGate>
    </ReduxProvider>
  );
}

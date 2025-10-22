import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StackNavigation from './navigation/Stack';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StackNavigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;

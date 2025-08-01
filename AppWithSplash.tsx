import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen } from './src/components';
import App from './App'; // Your main app component

export default function AppWithSplash() {
  const [isLoading, setIsLoading] = useState(true);
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        // You can add your app initialization logic here
        
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = () => {
    if (appIsReady) {
      setIsLoading(false);
    }
  };

  if (isLoading || !appIsReady) {
    return (
      <SplashScreen
        onFinish={() => setIsLoading(false)}
        duration={3000}
      />
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <App />
    </>
  );
}

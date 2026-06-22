import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.marbnb.app',
  appName: 'Marbnb',
  webDir: 'out',
  server: {
    url: 'https://marbnb-alpha.vercel.app',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#fff8ec',
      showSpinner: false,
    },
  },
};

export default config;

import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'vibing-app',
  webDir: 'www',
  bundledWebRuntime: false,
  cordova: {},
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;

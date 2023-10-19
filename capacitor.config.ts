import { CapacitorConfig } from '@capacitor/cli';
import { ScreenOrientation } from '@capacitor/screen-orientation';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'vibing-app',
  webDir: 'www',
  bundledWebRuntime: false,
  cordova: {},
  plugins: {
    ScreenOrientation: {
      web: ScreenOrientation,
    },
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'picinas-app',
  webDir: 'www',
  plugins: {
    Camera: {
      webUseInput: true, // Permitir usar <input> en lugar de la cámara en la web
    },
  },
};

export default config;
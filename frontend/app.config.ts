// Read version from package.json to avoid hardcoded defaults in production
// Using require to ensure compatibility in the config runtime
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require("./package.json");

import { ConfigContext, ExpoConfig } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {


  // Determine API URL for runtime
  const apiUrl = (process.env.EXPO_PUBLIC_API_URL || 
                  process.env.EXPO_PUBLIC_API_BASE_URL ||
                  config.extra?.apiUrl ||
                  "https://3lgkw9cxpk.execute-api.ap-south-1.amazonaws.com/default").replace(/\/$/, "");

  const envVersion =
    process.env.APP_VERSION || process.env.EXPO_PUBLIC_APP_VERSION;
    
  const resolvedConfig = {
    ...config,
    // Ensure required fields are present for typing
    name: config.name ?? "pec-event-app",
    slug: config.slug ?? "pec-event-app",
    // Prefer explicitly provided version, then env, then package.json version
    version: config.version ?? envVersion ?? packageJson.version,
    plugins: config.plugins,
    extra: {
      ...config.extra,
      // Make the API URL available in the app
      apiUrl,
    },
  };

  return resolvedConfig;
};

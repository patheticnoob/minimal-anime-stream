declare global {
  interface Window {
    /**
     * Navigate to the auth page with a custom redirect URL
     * @param redirectUrl - URL to redirect to after successful authentication
     */
    navigateToAuth: (redirectUrl: string) => void;
  }
}

declare global {
  interface Window {
    google?: {
      ima: {
        AdDisplayContainer: any;
        AdsLoader: any;
        AdsRequest: any;
        AdsRenderingSettings: any;
        AdsManagerLoadedEvent: any;
        AdErrorEvent: any;
        AdEvent: any;
        ViewMode: any;
      };
    };
    hls?: any;
  }
}

export {};
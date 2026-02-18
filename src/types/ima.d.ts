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
  }
}

export {};

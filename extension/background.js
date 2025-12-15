// GojoStream Controller Support - Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('🎮 GojoStream Controller Support Extension Installed');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CONTROLLER_STATUS') {
    // Handle controller status updates
    console.log('Controller status:', request.data);
  }
  sendResponse({ success: true });
});

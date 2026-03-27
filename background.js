// Background service worker for state management and communication
chrome.runtime.onInstalled.addListener(() => {
  console.log("UI Friction Detector Extension Installed");
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getScanResult") {
    chrome.storage.local.get(["lastScan"], (result) => {
      sendResponse(result.lastScan || null);
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === "saveScanResult") {
    chrome.storage.local.set({ lastScan: request.data }, () => {
      sendResponse({ status: "success" });
    });
    return true;
  }
});

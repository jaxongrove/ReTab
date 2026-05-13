// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);

  if (message.type === "getTabsForSave") {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      console.log("Tabs retrieved:", tabs);
      const urls = tabs.map(tab => tab.url).join('\n');
      sendResponse({ success: true, urls: urls });
    });
    return true; // Keeps the message channel open for async response
  }
});
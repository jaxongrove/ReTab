chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);

  if (message.type === "saveTabs") {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      console.log("Tabs retrieved:", tabs);

      const urls = tabs.map(tab => tab.url).join('\n');
      const dataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(urls);

      chrome.downloads.download({
        url: dataUrl,
        filename: message.filename || "tabs.txt"
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error("Download error:", chrome.runtime.lastError.message);
          sendResponse({ success: false });
        } else {
          console.log("Download started with ID:", downloadId);
          sendResponse({ success: true });
        }
      });
    });

    return true; // Keeps the message channel open for async response
  }
});
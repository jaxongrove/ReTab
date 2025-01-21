document.getElementById("save").addEventListener("click", () => {
  const filename = document.getElementById("filename").value || "tabs.txt";

  chrome.runtime.sendMessage({ type: "saveTabs", filename }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error sending message:", chrome.runtime.lastError.message);
      alert("Failed to communicate with the extension.");
    } else if (response && response.success) {
      alert("Tabs saved successfully!");
    } else {
      alert("Failed to save tabs.");
    }
  });
});

document.getElementById("openTabs").addEventListener("click", () => {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    const urls = event.target.result.split('\n').map(url => url.trim()).filter(url => url.length > 0);
    if (urls.length > 0) {
      openUrlsInNewTabs(urls);
    } else {
      alert("No valid URLs found in the file.");
    }
  };
  reader.onerror = function(error) {
    console.error("Error reading file:", error);
    alert("Error reading file.");
  };

  reader.readAsText(file);
});

function openUrlsInNewTabs(urls) {
  // Open each URL in a new tab
  urls.forEach(url => {
    chrome.tabs.create({ url: url });
  });
}

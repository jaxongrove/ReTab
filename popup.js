// popup.js

document.addEventListener("DOMContentLoaded", () => {
  populateSavedFilesDropdown();

  document.getElementById("saveTabsButton").addEventListener("click", saveCurrentTabs);
  document.getElementById("loadSelectedButton").addEventListener("click", loadSelectedTabs);
  document.getElementById("deleteSelectedButton").addEventListener("click", deleteSelectedTabs);
});

async function saveCurrentTabs() {
  const filename = document.getElementById("filenameInput").value.trim();

  if (!filename) {
    alert("Please enter a filename to save the tabs.");
    return;
  }

  // Request tabs from the background script
  const response = await chrome.runtime.sendMessage({ type: "getTabsForSave" });

  if (response && response.success) {
    const urls = response.urls;
    try {
      await chrome.storage.local.set({ [filename]: urls });
      alert(`Tabs saved successfully as "${filename}"!`);
      document.getElementById("filenameInput").value = ""; // Clear input
      populateSavedFilesDropdown(); // Refresh the list
    } catch (error) {
      console.error("Error saving tabs to storage:", error);
      alert("Failed to save tabs.");
    }
  } else {
    alert("Failed to get current tabs for saving.");
  }
}

async function loadSelectedTabs() {
  const dropdown = document.getElementById("savedFilesDropdown");
  const filename = dropdown.value;

  if (!filename) {
    alert("Please select a tab list to load.");
    return;
  }

  try {
    const data = await chrome.storage.local.get(filename);
    const urlsString = data[filename];

    if (urlsString) {
      const urls = urlsString.split('\n').map(url => url.trim()).filter(url => url.length > 0);
      if (urls.length > 0) {
        openUrlsInNewTabs(urls);
        alert(`Tabs from "${filename}" loaded successfully!`);
      } else {
        alert("No valid URLs found in the selected list.");
      }
    } else {
      alert(`No data found for "${filename}". It might have been deleted.`);
    }
  } catch (error) {
    console.error("Error loading tabs from storage:", error);
    alert("Failed to load tabs.");
  }
}

async function deleteSelectedTabs() {
  const dropdown = document.getElementById("savedFilesDropdown");
  const filename = dropdown.value;

  if (!filename) {
    alert("Please select a tab list to delete.");
    return;
  }

  if (confirm(`Are you sure you want to delete "${filename}"?`)) {
    try {
      await chrome.storage.local.remove(filename);
      alert(`"${filename}" deleted successfully.`);
      populateSavedFilesDropdown(); // Refresh the list
    } catch (error) {
      console.error("Error deleting tabs from storage:", error);
      alert("Failed to delete tab list.");
    }
  }
}

async function populateSavedFilesDropdown() {
  const dropdown = document.getElementById("savedFilesDropdown");
  dropdown.innerHTML = '<option value="">-- Select a saved list --</option>'; // Clear and add default

  try {
    const allItems = await chrome.storage.local.get(null); // Get all items
    const filenames = Object.keys(allItems);

    if (filenames.length > 0) {
      filenames.sort().forEach(filename => {
        const option = document.createElement("option");
        option.value = filename;
        option.textContent = filename;
        dropdown.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error populating saved files dropdown:", error);
    // Optionally display an error in the UI
  }
}

function openUrlsInNewTabs(urls) {
  urls.forEach(url => {
    chrome.tabs.create({ url: url }).catch(error => {
      console.error(`Failed to open URL ${url}:`, error);
      // You might want to provide more specific user feedback here
    });
  });
}
// Utility function to show notifications
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.className = `fixed bottom-4 right-4 p-2 rounded-md text-white ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}`;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

const buttons = {
  'scrape-a': 'a',
  'scrape-p': 'p',
  'scrape-h': 'h',
  'scrape-custom': 'custom'
};

Object.keys(buttons).forEach(id => {
  document.getElementById(id).addEventListener('click', () => {
    const customRule = id === 'scrape-custom' ? document.getElementById('custom-rule').value : null;
    scrapeData(buttons[id], customRule);
  });
});

document.getElementById('preview-scrape').addEventListener('click', previewScrape);

function scrapeData(type, customRule = null) {
  toggleLoading(true);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: scrapePage,
      args: [type, customRule]
    }, (injectionResults) => {
      if (chrome.runtime.lastError) {
        showNotification('Error: ' + chrome.runtime.lastError.message, 'error');
        toggleLoading(false);
        return;
      }
      injectionResults.forEach(frameResult => {
        displayResults(frameResult.result);
        toggleLoading(false);
      });
    });
  });
}

function toggleLoading(isLoading) {
  document.getElementById('spinner').style.display = isLoading ? 'block' : 'none';
  document.getElementById('results').style.display = isLoading ? 'none' : 'block';
}

function scrapePage(type, customRule = null) {
  const data = { type, url: window.location.href, customRule };
  return fetch('http://localhost:5000/scrape?' + new URLSearchParams(data))
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      }
      return data.slice(0, 50);
    })
    .catch(error => {
      console.error('Scraping error:', error);
      return [{ error: error.message || 'Failed to fetch data' }];
    });
}

function displayResults(results) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '<h2 class="text-lg font-semibold text-gray-700 mb-2">Results</h2>';

  if (results[0]?.error) {
    const errorP = document.createElement('p');
    errorP.textContent = results[0].error;
    errorP.className = 'text-red-500 font-bold';
    resultsDiv.appendChild(errorP);
  } else {
    const list = document.createElement('ul');
    list.className = 'list-disc pl-5';
    results.forEach(result => {
      const li = document.createElement('li');
      if (typeof result === 'object') {
        if (result.href) {
          li.innerHTML = `<a href="${result.href}" target="_blank" class="text-blue-500 hover:underline">${result.text || result.href}</a>`;
        } else if (result.tag) {
          li.innerHTML = `<${result.tag}>${result.text}</${result.tag}>`;
        } else {
          li.textContent = result.text || JSON.stringify(result);
        }
      } else {
        li.textContent = result;
      }
      li.className = 'mb-1 text-gray-700';
      list.appendChild(li);
    });
    resultsDiv.appendChild(list);
  }
}

function previewScrape() {
  const customRule = document.getElementById('custom-rule').value;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: previewScrapePage,
      args: [customRule]
    }, (result) => {
      if (chrome.runtime.lastError) {
        showNotification('Preview error: ' + chrome.runtime.lastError.message, 'error');
      } else if (result[0].result === 0) {
        showNotification('No elements found with the given selector', 'error');
      } else {
        showNotification(`Highlighted ${result[0].result} elements on the page`);
      }
    });
  });
}

function previewScrapePage(customRule) {
  const elements = document.querySelectorAll(customRule);
  elements.forEach(el => {
    el.style.outline = '2px solid red';
    el.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
  });
  setTimeout(() => {
    elements.forEach(el => {
      el.style.outline = '';
      el.style.backgroundColor = '';
    });
  }, 2000);
  return elements.length;
}

document.getElementById('export-csv').addEventListener('click', () => exportData('csv'));
document.getElementById('export-json').addEventListener('click', () => exportData('json'));

function exportData(format) {
  const resultsDiv = document.getElementById('results');
  const data = Array.from(resultsDiv.querySelectorAll('li')).map(li => {
    const link = li.querySelector('a');
    if (link) {
      return { text: link.textContent, href: link.href };
    }
    return li.textContent;
  });

  if (data.length === 0) {
    showNotification('No data to export', 'error');
    return;
  }

  if (format === 'csv') {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (typeof data[0] === 'object') {
      csvContent += "Text,URL\n";
      csvContent += data.map(item => `"${item.text}","${item.href}"`).join("\n");
    } else {
      csvContent += data.join("\n");
    }
    downloadFile(csvContent, "scraped_data.csv");
  } else if (format === 'json') {
    const jsonContent = "data:text/json;charset=utf-8," + JSON.stringify(data, null, 2);
    downloadFile(jsonContent, "scraped_data.json");
  }
}

function downloadFile(content, filename) {
  const encodedUri = encodeURI(content);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  showNotification(`${filename} downloaded successfully`);
}

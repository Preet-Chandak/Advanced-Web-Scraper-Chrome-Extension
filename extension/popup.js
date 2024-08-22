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
  toggleLoading(true); // Show spinner
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: scrapePage,
      args: [type, customRule]
    }, (injectionResults) => {
      injectionResults.forEach(frameResult => {
        displayResults(frameResult.result);
        toggleLoading(false); // Hide spinner
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
    .then(data => data.slice(0, 50))
    .catch(error => [{ error: 'Failed to fetch data' }]);
}

function displayResults(results) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  if (results[0]?.error) {
    const errorP = document.createElement('p');
    errorP.textContent = results[0].error;
    errorP.className = 'error';
    resultsDiv.appendChild(errorP);
  } else {
    results.forEach(result => {
      const p = document.createElement('p');
      p.textContent = result;
      resultsDiv.appendChild(p);
    });
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
    });
  });
}

function previewScrapePage(customRule) {
  document.querySelectorAll(customRule).forEach(el => {
    el.style.border = '2px solid red';
  });
}

document.getElementById('export-csv').addEventListener('click', () => exportData('csv'));
document.getElementById('export-json').addEventListener('click', () => exportData('json'));

function exportData(format) {
  const resultsDiv = document.getElementById('results');
  const data = Array.from(resultsDiv.getElementsByTagName('p')).map(p => p.textContent);

  if (format === 'csv') {
    const csvContent = "data:text/csv;charset=utf-8," + data.join("\n");
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
}

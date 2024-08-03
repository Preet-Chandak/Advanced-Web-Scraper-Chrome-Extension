document.getElementById('scrape-a').addEventListener('click', () => scrapeData('a'));
document.getElementById('scrape-p').addEventListener('click', () => scrapeData('p'));
document.getElementById('scrape-h').addEventListener('click', () => scrapeData('h'));

function scrapeData(type) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        function: scrapePage,
        args: [type]
      },
      (injectionResults) => {
        for (const frameResult of injectionResults) {
          displayResults(frameResult.result);
        }
      }
    );
  });
}

function scrapePage(type) {
  const data = { type: type, url: window.location.href };
  return fetch('http://localhost:5000/scrape?' + new URLSearchParams(data))
    .then(response => response.json())
    .then(data => data.slice(0, 50))
    .catch(error => {
      console.error('Error:', error);
      return [{ error: 'Failed to fetch data' }];
    });
}

function displayResults(results) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  if (results[0] && results[0].error) {
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

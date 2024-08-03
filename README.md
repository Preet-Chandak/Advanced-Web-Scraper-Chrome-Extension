# Advanced Web Scraper Chrome Extension

## Description
This Chrome extension provides an advanced web scraping and analysis tool. It allows users to scrape various types of content from web pages, including links, paragraphs, headings, and images. It also offers page analysis features such as word count, link count, and meta tag information.

## Features
- Scrape links, paragraphs, headings, and images from web pages
- Adjustable scraping depth for more comprehensive data collection
- Page analysis including word count, link count, image count, and heading distribution
- Meta tag analysis
- User-friendly popup interface

## Installation

### Server Setup
1. Ensure you have Python 3.7+ installed
2. Clone this repository:
   ```
   git clone https://github.com/your-username/advanced-web-scraper.git
   cd advanced-web-scraper
   ```
3. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
4. Install the required packages:
   ```
   pip install flask requests beautifulsoup4 flask-cors
   ```
5. Run the Flask server:
   ```
   python app.py
   ```

### Chrome Extension Setup
1. Open Google Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `extension` directory from this project
4. The extension icon should now appear in your Chrome toolbar

## Usage
1. Click on the extension icon in your Chrome toolbar
2. Select the type of content you want to scrape (links, paragraphs, headings, or images)
3. Set the scraping depth (1-3)
4. Click "Scrape" to start scraping the current page
5. Click "Analyze Page" to get an analysis of the current page
6. View the results in the popup window

## Development
- The server-side code is in `app.py`
- The Chrome extension files are in the `extension` directory
- Modify `popup.html` and `popup.js` to change the extension's user interface and functionality
- Update `app.py` to modify or extend the scraping and analysis features

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## Disclaimer
This tool is for educational purposes only. Always respect websites' robots.txt files and terms of service when scraping. Use responsibly and ethically.

from flask import Flask, request, jsonify
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def scrape_using_playwright(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)
        content = page.content()
        browser.close()
        return content

@app.route('/scrape')
def scrape():
    url = request.args.get('url')
    scrape_type = request.args.get('type')
    custom_rule = request.args.get('customRule')

    if not url or not scrape_type:
        return jsonify({"error": "Missing URL or scrape type"}), 400

    try:
        page_source = scrape_using_playwright(url)
    except Exception as e:
        return jsonify({"error": f"Failed to fetch URL: {str(e)}"}), 500

    soup = BeautifulSoup(page_source, 'html.parser')
    data = []

    if scrape_type == 'custom' and custom_rule:
        elements = soup.select(custom_rule)
        data = [element.get_text(strip=True) for element in elements]
    else:
        if scrape_type == 'a':
            elements = soup.find_all('a')
            data = [element.get('href') for element in elements if element.get('href')]
        elif scrape_type == 'p':
            elements = soup.find_all('p')
            data = [element.get_text(strip=True) for element in elements]
        elif scrape_type == 'h':
            elements = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
            data = [element.get_text(strip=True) for element in elements]
        else:
            return jsonify({"error": "Invalid scrape type"}), 400

    return jsonify(data[:50])

if __name__ == '__main__':
    app.run(debug=True)

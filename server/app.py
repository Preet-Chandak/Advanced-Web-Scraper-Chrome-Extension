from flask import Flask, request, jsonify, send_file
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from flask_cors import CORS
import logging
import io
import json

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

def scrape_using_playwright(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto(url, timeout=30000)
            content = page.content()
        except Exception as e:
            logging.error(f"Error fetching URL: {str(e)}")
            raise
        finally:
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
        data = [{"text": element.get_text(strip=True), "html": str(element)} for element in elements]
    else:
        if scrape_type == 'a':
            elements = soup.find_all('a')
            data = [{"text": element.get_text(strip=True), "href": element.get('href')} for element in elements if element.get('href')]
        elif scrape_type == 'p':
            elements = soup.find_all('p')
            data = [{"text": element.get_text(strip=True), "html": str(element)} for element in elements]
        elif scrape_type == 'h':
            elements = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
            data = [{"text": element.get_text(strip=True), "tag": element.name, "html": str(element)} for element in elements]
        else:
            return jsonify({"error": "Invalid scrape type"}), 400

    return jsonify(data[:50])

@app.route('/download-html')
def download_html():
    url = request.args.get('url')
    if not url:
        return jsonify({"error": "Missing URL"}), 400

    try:
        page_source = scrape_using_playwright(url)
        return send_file(
            io.BytesIO(page_source.encode('utf-8')),
            mimetype='text/html',
            as_attachment=True,
            attachment_filename='scraped_page.html'
        )
    except Exception as e:
        return jsonify({"error": f"Failed to fetch URL: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
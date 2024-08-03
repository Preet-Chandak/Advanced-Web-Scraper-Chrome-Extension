from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def filter_data(elements, data_type):
    filtered_data = []
    for element in elements:
        if data_type == 'a':
            href = element.get('href')
            if href and href.startswith('http'):
                filtered_data.append(href)
        elif data_type == 'p':
            text = element.get_text(strip=True)
            if len(text) > 30:  # Filtering out short paragraphs
                filtered_data.append(text)
        elif data_type == 'h':
            text = element.get_text(strip=True)
            filtered_data.append(text)
    return filtered_data

@app.route('/scrape')
def scrape():
    url = request.args.get('url')
    scrape_type = request.args.get('type')

    if not url or not scrape_type:
        return jsonify({"error": "Missing URL or scrape type"}), 400

    try:
        response = requests.get(url)
        response.raise_for_status()
    except requests.RequestException as e:
        return jsonify({"error": f"Failed to fetch URL: {str(e)}"}), 500

    soup = BeautifulSoup(response.text, 'html.parser')

    if scrape_type == 'a':
        elements = soup.find_all('a')
    elif scrape_type == 'p':
        elements = soup.find_all('p')
    elif scrape_type == 'h':
        elements = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
    else:
        return jsonify({"error": "Invalid scrape type"}), 400

    data = filter_data(elements, scrape_type)

    return jsonify(data[:50])

if __name__ == '__main__':
    app.run(debug=True)
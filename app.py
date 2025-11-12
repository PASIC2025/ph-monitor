from flask import Flask, request, jsonify, send_from_directory # send_from_directory is new
from datetime import datetime
from flask_cors import CORS 

app = Flask(__name__)
# CORS is mainly needed for local development, but good practice
CORS(app) 

# Global in-memory storage (data will be lost when the server restarts)
PH_DATA_STORE = []

# --- 1. Endpoint for Webpage (Frontend) ---
@app.route('/')
def serve_index():
    # This tells Flask to look for 'index.html' in the current directory and serve it.
    return send_from_directory('.', 'index.html') 

# --- 2. Endpoint for Android App to POST data ---
@app.route('/api/upload-ph', methods=['POST'])
def upload_ph():
    data = request.json
    
    if 'timestamp' not in data or 'ph' not in data:
        return jsonify({"error": "Missing timestamp or ph value"}), 400

    try:
        new_reading = {
            "timestamp": int(data['timestamp']),
            "ph": float(data['ph'])
        }
        PH_DATA_STORE.append(new_reading)
        
        print(f"New pH reading received: {new_reading}")
        return jsonify({"message": "Data received successfully"}), 201
    except ValueError:
        return jsonify({"error": "Invalid data type for timestamp or ph"}), 400

# --- 3. Endpoint for Webpage to GET data ---
@app.route('/api/ph-data', methods=['GET'])
def get_ph_data():
    # Return the entire list of data stored in memory
    return jsonify(PH_DATA_STORE)

# --- 4. Endpoint for JavaScript File ---
@app.route('/app.js')
def serve_js():
    # Serve the JavaScript file
    return send_from_directory('.', 'app.js')

if __name__ == '__main__':
    # Use a dynamic port for local testing, but Render will handle the port
    app.run(host='0.0.0.0', port=5000, debug=True)
from flask import Flask, request, jsonify, render_template
from model import SpamModel
import os

app = Flask(__name__)

# Initialize model
spam_detector = SpamModel()

# Try to train on startup, but catch errors gracefully for UI feedback
startup_error = None
try:
    spam_detector.train()
    print("✓ Model trained successfully!")
except Exception as e:
    startup_error = str(e)
    print(f"✗ Failed to initialize model on startup: {startup_error}")

@app.route('/')
def index():
    return render_template('index.html', error=startup_error)

@app.route('/status', methods=['GET'])
def status():
    """Check application status"""
    return jsonify({
        "model_trained": spam_detector.is_trained,
        "error": startup_error
    })

@app.route('/predict', methods=['POST'])
def predict():
    if not spam_detector.is_trained:
        return jsonify({"error": "Model failed to train. Please check if the dataset file 'spam.csv' exists in the project directory.", "status": "error"}), 500

    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided", "status": "error"}), 400
    
    message = data.get('message', '').strip()
    
    if not message:
        return jsonify({"error": "Message cannot be empty.", "status": "error"}), 400

    if len(message) < 5:
        return jsonify({"error": "Message must be at least 5 characters long.", "status": "error"}), 400

    try:
        result = spam_detector.predict(message)
        result['status'] = 'success'
        return jsonify(result)
    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({"error": f"Error analyzing message: {str(e)}", "status": "error"}), 500

@app.route('/stats', methods=['GET'])
def stats():
    if not spam_detector.is_trained:
        return jsonify({"error": "Model not trained", "status": "error"}), 500
    
    stats = spam_detector.get_stats()
    stats['status'] = 'success'
    return jsonify(stats)

if __name__ == '__main__':
    # Using threaded mode to handle multiple rapid requests nicely
    app.run(debug=True, threaded=True, host='127.0.0.1', port=5000)

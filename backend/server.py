from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # allow requests from React frontend

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_images():
    files = request.files.getlist('images')
    timer = request.form.get('timer')
    count = request.form.get('count')

    for file in files:
        file.save(os.path.join(UPLOAD_FOLDER, file.filename))

    print(f"Received {len(files)} images, {count} images will be shown for {timer} seconds each.")
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(port=5000)

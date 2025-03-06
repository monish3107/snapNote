from flask import Flask, request, jsonify
from google.cloud import vision
import os
from flask_cors import CORS
import firebase_admin
from firebase_admin import auth, firestore, credentials
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get credentials path from environment variables
firebase_creds_path = os.getenv('FIREBASE_ADMIN_CREDENTIALS')
vision_api_creds_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')

# Initialize Firebase Admin SDK
cred = credentials.Certificate(firebase_creds_path)
firebase_admin.initialize_app(cred)

# Get Firestore database
db = firestore.client()

# Free usage limit
FREE_USAGE_LIMIT = 5

@app.route('/get-usage-stats', methods=['POST'])
def get_usage_stats():
    token = request.json.get('token')

    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']

        # Get user document
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()

        if not user_doc.exists:
            # Initialize new user with zero API usage
            user_ref.set({
                'api_usage_count': 0,
                'custom_api_key': None,
                'name': decoded_token.get('name'),
                'email': decoded_token.get('email')
            })
            return jsonify({
                'api_usage_count': 0,
                'remaining_uses': FREE_USAGE_LIMIT,
                'has_custom_key': False
            })

        user_data = user_doc.to_dict()
        api_usage_count = user_data.get('api_usage_count', 0)
        custom_api_key = user_data.get('custom_api_key')

        return jsonify({
            'api_usage_count': api_usage_count,
            'remaining_uses': FREE_USAGE_LIMIT - api_usage_count,
            'has_custom_key': custom_api_key is not None
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 401

@app.route('/verify-firebase-token', methods=['POST'])
def verify_firebase_token():
    token = request.json.get('token')
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']

        # Get or create user document in Firestore
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()

        if not user_doc.exists:
            # Initialize new user with zero API usage
            user_ref.set({
                'api_usage_count': 0,
                'custom_api_key': None,
                'name': decoded_token.get('name'),
                'email': decoded_token.get('email'),
                'picture': decoded_token.get('picture')
            })
            user_data = {
                'uid': uid,
                'name': decoded_token.get('name'),
                'email': decoded_token.get('email'),
                'picture': decoded_token.get('picture'),
                'api_usage_count': 0,
                'custom_api_key': None
            }
        else:
            user_data = user_doc.to_dict()
            user_data['uid'] = uid

        return jsonify({'user': user_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 401

@app.route('/save-api-key', methods=['POST'])
def save_api_key():
    token = request.json.get('token')
    api_key = request.json.get('apiKey')

    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']

        # Update user document with custom API key
        user_ref = db.collection('users').document(uid)
        user_ref.update({
            'custom_api_key': api_key
        })

        return jsonify({'success': True, 'message': 'API key saved successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 401

@app.route('/clear-api-key', methods=['POST'])
def clear_api_key():
    token = request.json.get('token')

    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']

        # Clear custom API key
        user_ref = db.collection('users').document(uid)
        user_ref.update({
            'custom_api_key': None
        })

        return jsonify({'success': True, 'message': 'API key cleared successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 401

@app.route('/extract-text', methods=['POST'])
def extract_text():
    print("Received request to /extract-text")  # Debugging
    if 'image' not in request.files:
        print("No image uploaded")
        return jsonify({'error': 'No image uploaded'}), 400

    token = request.form.get('token')
    if not token:
        print("Authentication required")
        return jsonify({'error': 'Authentication required'}), 401

    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']

        # Get user document
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()

        if not user_doc.exists:
            print("User not found")
            return jsonify({'error': 'User not found'}), 404

        user_data = user_doc.to_dict()
        api_usage_count = user_data.get('api_usage_count', 0)
        custom_api_key = user_data.get('custom_api_key')

        # Check if user has a custom API key or is within free usage limit
        if custom_api_key:
            # Use custom API key
            try:
                # Create a temporary JSON file with the custom API key
                temp_key_path = f"temp_{uid}_key.json"
                with open(temp_key_path, 'w') as f:
                    json.dump(json.loads(custom_api_key), f)

                # Store original credentials to restore later
                original_credentials = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
                
                # Use the temporary credentials file
                os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = temp_key_path
                client = vision.ImageAnnotatorClient()

                # Process the image
                image_file = request.files['image']
                content = image_file.read()
                print(f"Image size: {len(content)} bytes")  # Log image size
                image = vision.Image(content=content)
                response = client.text_detection(image=image)

                # Clean up temporary file
                os.remove(temp_key_path)
                
                # Restore original credentials
                if original_credentials:
                    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = original_credentials
                else:
                    os.environ.pop("GOOGLE_APPLICATION_CREDENTIALS", None)

                if response.text_annotations:
                    extracted_text = response.text_annotations[0].description
                    print(f"Extracted text: {extracted_text}")  # Log extracted text
                    return jsonify({'text': extracted_text})
                else:
                    print("No text found in the image")
                    return jsonify({'error': 'No text found'}), 400

            except Exception as e:
                print(f"Error with custom API key: {str(e)}")
                return jsonify({'error': f'Error with custom API key: {str(e)}'}), 400
        elif api_usage_count < FREE_USAGE_LIMIT:
            # Use default API key for free usage
            client = vision.ImageAnnotatorClient()

            # Process the image
            image_file = request.files['image']
            content = image_file.read()
            print(f"Image size: {len(content)} bytes")  # Log image size
            image = vision.Image(content=content)
            response = client.text_detection(image=image)

            # Increment usage count
            user_ref.update({
                'api_usage_count': api_usage_count + 1
            })

            if response.text_annotations:
                extracted_text = response.text_annotations[0].description
                print(f"Extracted text: {extracted_text}")  # Log extracted text
                remaining_uses = FREE_USAGE_LIMIT - (api_usage_count + 1)
                return jsonify({
                    'text': extracted_text,
                    'remaining_uses': remaining_uses
                })
            else:
                print("No text found in the image")
                return jsonify({'error': 'No text found'}), 400
        else:
            # User has reached free usage limit and has no custom API key
            print("Free usage limit reached")
            return jsonify({
                'error': 'Free usage limit reached',
                'limit_reached': True
            }), 403

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=int(environ.get("PORT", 5000)))

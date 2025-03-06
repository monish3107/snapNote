import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, auth, firestore

# Load environment variables
load_dotenv()

# Get Firebase credentials from .env
firebase_credentials_path = os.getenv("FIREBASE_ADMIN_CREDENTIALS", "firebase-admin-sdk.json")

# Initialize Firebase
cred = credentials.Certificate(firebase_credentials_path)
if not firebase_admin._apps:  # Prevent re-initialization error
    firebase_app = firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

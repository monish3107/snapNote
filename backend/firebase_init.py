# Update firebase_init.py to initialize Firestore
import firebase_admin
from firebase_admin import credentials, auth, firestore

# Initialize Firebase Admin SDK
cred = credentials.Certificate("C:/Users/parul/OneDrive/Desktop/snapNote/backend/firebase-admin-sdk.json")
firebase_app = firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()
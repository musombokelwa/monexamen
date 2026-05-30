import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'super-secret-key-pour-monexamen-jwt')
    
    # Database config is now in database/db.py (MySQL)
    
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads', 'documents')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024 # 16 MB max limit

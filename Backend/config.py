import os
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

class Config:
    """Configuration de base"""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'super-secret-key-pour-monexamen-jwt')
    JWT_SECRET = os.environ.get('JWT_SECRET', os.environ.get('SECRET_KEY', 'super-secret-key-pour-monexamen-jwt'))
    API_KEY = os.environ.get('API_KEY', 'default-api-key')
    
    # Flask configuration
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    # Upload configuration
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads', 'documents')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max limit
    
    # CORS configuration
    ENABLE_CORS = os.environ.get('ENABLE_CORS', 'True').lower() == 'true'
    
    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')

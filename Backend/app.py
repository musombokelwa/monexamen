from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
import os

# Import controllers (which contain blueprints)
from routes.auth_routes import auth_bp
from routes.document_routes import document_bp
from routes.student_routes import student_bp
from routes.admin_routes import admin_bp
from routes.superadmin_routes import superadmin_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # CORS configuration: allow all onrender.com subdomains + localhost for dev
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5000",
    ]
    # Add any custom frontend URL from environment variable
    frontend_url = os.environ.get('FRONTEND_URL', '')
    if frontend_url:
        allowed_origins.append(frontend_url.rstrip('/'))

    CORS(app, resources={
        r"/api/*": {
            "origins": allowed_origins,
            "allow_headers": ["Content-Type", "Authorization"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "supports_credentials": True,
        }
    }, origins="*")  # wildcard fallback for onrender.com dynamic subdomains
    
    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(document_bp, url_prefix='/api')
    app.register_blueprint(student_bp, url_prefix='/api/student')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(superadmin_bp, url_prefix='/api/superadmin')
    
    @app.route('/', methods=['GET'])
    def index():
        return jsonify({"message": "Welcome to MonExamen API", "status": "running"}), 200

    @app.route('/api/health', methods=['GET'])
    def health():
        """Health check endpoint for monitoring"""
        return jsonify({"status": "healthy", "service": "monexamen-api"}), 200

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
        
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

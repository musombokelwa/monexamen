from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
import os
import re

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
        "http://localhost:5500",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5000",
        r"https://.*\.onrender\.com",
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
        """Health check endpoint for monitoring — also tests DB connectivity"""
        from database.db import get_connection
        db_ok = False
        try:
            conn = get_connection()
            if conn:
                db_ok = True
                conn.close()
        except Exception as e:
            print(f"[HEALTH] DB check failed: {e}")

        return jsonify({
            "status": "healthy" if db_ok else "degraded",
            "service": "monexamen-api",
            "database": "connected" if db_ok else "disconnected"
        }), 200

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
        
    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"[MonExamen] Starting Flask dev server on 0.0.0.0:{port}")
    print(f"[MonExamen] FLASK_ENV={os.environ.get('FLASK_ENV', 'development')}")
    print(f"[MonExamen] DATABASE_URL set: {bool(os.environ.get('DATABASE_URL'))}")
    app.run(debug=True, host='0.0.0.0', port=port)


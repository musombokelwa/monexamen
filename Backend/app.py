from flask import Flask, jsonify
from flask_cors import CORS
from config import Config

# Import controllers (which contain blueprints)
# We will create these shortly
from routes.auth_routes import auth_bp
from routes.document_routes import document_bp
from routes.student_routes import student_bp
from routes.admin_routes import admin_bp
from routes.superadmin_routes import superadmin_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS for all routes, allowing credentials if needed
    CORS(app)
    
    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(document_bp, url_prefix='/api')
    app.register_blueprint(student_bp, url_prefix='/api/student')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(superadmin_bp, url_prefix='/api/superadmin')
    
    @app.route('/', methods=['GET'])
    def index():
        return jsonify({"message": "Welcome to MonExamen API", "status": "running"}), 200

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
        
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)

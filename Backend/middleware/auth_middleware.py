from functools import wraps
from flask import request, jsonify
from utils.jwt_helper import decode_token
from models.user_model import UserModel

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Expect token in Authorization header as "Bearer <token>"
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            parts = auth_header.split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
            
        payload = decode_token(token)
        
        if isinstance(payload, str):
            # It's an error message
            return jsonify({'message': payload}), 401
            
        current_user = UserModel.get_user_by_id(payload['sub'])
        if not current_user:
            return jsonify({'message': 'User not found!'}), 401
            
        return f(current_user, *args, **kwargs)
        
    return decorated

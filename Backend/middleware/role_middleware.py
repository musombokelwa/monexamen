from functools import wraps
from flask import jsonify

def role_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            if current_user['role'] not in roles:
                return jsonify({'message': f'Access denied. Requires one of roles: {", ".join(roles)}'}), 403
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator

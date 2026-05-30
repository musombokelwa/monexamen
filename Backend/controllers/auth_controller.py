from flask import request, jsonify
from models.user_model import UserModel
from utils.validators import is_valid_email, is_valid_password
from utils.helpers import check_password
from utils.jwt_helper import generate_token

class AuthController:
    @staticmethod
    def register():
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        fullname = data.get('fullname')
        email = data.get('email')
        password = data.get('password')
        promotion_id = data.get('promotion_id')
        department_id = data.get('department_id')

        # Convert empty strings to None for integer foreign keys
        if not promotion_id or promotion_id == "":
            promotion_id = None
        else:
            promotion_id = int(promotion_id)

        if not department_id or department_id == "":
            department_id = None
        else:
            department_id = int(department_id)

        if not fullname or not email or not password:
            return jsonify({'message': 'Missing required fields'}), 400

        if not is_valid_email(email):
            return jsonify({'message': 'Invalid email format'}), 400

        if not is_valid_password(password):
            return jsonify({'message': 'Password must be at least 6 characters long'}), 400

        existing_user = UserModel.get_user_by_email(email)
        if existing_user:
            return jsonify({'message': 'Email already registered'}), 409

        # Automatically assign 'student' role as per requirements
        # Students can self-register
        user_id = UserModel.create_user(
            fullname, email, password, role='student',
            promotion_id=promotion_id, department_id=department_id
        )
        user = UserModel.get_user_by_id(user_id)
        if not user:
            return jsonify({'message': 'Failed to retrieve created user'}), 500

        token = generate_token(user['id'], user['role'])
        user_data = dict(user)
        user_data.pop('password', None)

        return jsonify({
            'message': 'Registration successful',
            'token': token,
            'user': user_data
        }), 201

    @staticmethod
    def login():
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400

        user = UserModel.get_user_by_email(email)
        if not user:
            return jsonify({'message': 'Invalid credentials'}), 401

        if not check_password(password, user['password']):
            return jsonify({'message': 'Invalid credentials'}), 401

        token = generate_token(user['id'], user['role'])

        user_data = dict(user)
        user_data.pop('password', None)

        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user_data
        }), 200

    @staticmethod
    def get_me(current_user):
        # We don't want to send the password hash back
        user_data = dict(current_user)
        user_data.pop('password', None)
        return jsonify({'user': user_data}), 200

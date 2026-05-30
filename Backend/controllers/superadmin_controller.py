from flask import request, jsonify
from models.user_model import UserModel
from models.department_model import DepartmentModel
from models.promotion_model import PromotionModel
from models.document_model import DocumentModel
from database.db import get_all_logs, clear_logs as db_clear_logs

class SuperAdminController:
    @staticmethod
    def create_admin(current_user):
        data = request.get_json()
        fullname = data.get('fullname')
        email = data.get('email')
        password = data.get('password')
        
        if not fullname or not email or not password:
            return jsonify({'message': 'Missing required fields'}), 400
            
        existing_user = UserModel.get_user_by_email(email)
        if existing_user:
            return jsonify({'message': 'Email already registered'}), 409
            
        user_id = UserModel.create_user(fullname, email, password, role='admin')
        if not user_id:
            return jsonify({'message': 'Failed to create admin'}), 500
            
        return jsonify({'message': 'Admin created successfully', 'admin_id': user_id}), 201

    @staticmethod
    def delete_user(current_user, user_id):
        user = UserModel.get_user_by_id(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
            
        if user['role'] == 'superadmin':
            return jsonify({'message': 'Cannot delete superadmin'}), 403
            
        UserModel.delete_user(user_id)
        return jsonify({'message': 'User deleted successfully'}), 200

    @staticmethod
    def get_users(current_user):
        users = UserModel.get_all_users()
        return jsonify({'users': users}), 200

    @staticmethod
    def get_statistics(current_user):
        users = UserModel.get_all_users()
        docs = DocumentModel.get_all_documents()
        
        stats = {
            'total_students': sum(1 for u in users if u['role'] == 'student'),
            'total_admins': sum(1 for u in users if u['role'] == 'admin'),
            'total_documents': len(docs),
            'interros': sum(1 for d in docs if d['type'] == 'interro'),
            'examens': sum(1 for d in docs if d['type'] == 'examen')
        }
        return jsonify({'statistics': stats}), 200

    @staticmethod
    def create_department(current_user):
        data = request.get_json()
        name = data.get('name')
        if not name:
            return jsonify({'message': 'Department name required'}), 400
            
        dept_id = DepartmentModel.create_department(name)
        if not dept_id:
            return jsonify({'message': 'Failed to create department, maybe it already exists'}), 400
            
        return jsonify({'message': 'Department created', 'id': dept_id}), 201

    @staticmethod
    def create_promotion(current_user):
        data = request.get_json()
        name = data.get('name')
        if not name:
            return jsonify({'message': 'Promotion name required'}), 400
            
        prom_id = PromotionModel.create_promotion(name)
        if not prom_id:
            return jsonify({'message': 'Failed to create promotion, maybe it already exists'}), 400
            
        return jsonify({'message': 'Promotion created', 'id': prom_id}), 201

    @staticmethod
    def update_user(current_user, user_id):
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400
            
        # Extract editable fields
        updates = {}
        if 'fullname' in data: updates['fullname'] = data['fullname']
        if 'email' in data: updates['email'] = data['email']
        if 'password' in data and data['password']: updates['password'] = data['password']
        
        user = UserModel.get_user_by_id(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
            
        UserModel.update_user(user_id, updates)
        return jsonify({'message': 'User updated successfully'}), 200

    @staticmethod
    def get_logs(current_user):
        logs = get_all_logs()
        return jsonify({'logs': logs}), 200

    @staticmethod
    def clear_logs(current_user):
        db_clear_logs()
        return jsonify({'message': 'Logs cleared'}), 200

from flask import Blueprint
from controllers.superadmin_controller import SuperAdminController
from middleware.auth_middleware import token_required
from middleware.role_middleware import role_required

superadmin_bp = Blueprint('superadmin', __name__)

@superadmin_bp.route('/create-admin', methods=['POST'])
@token_required
@role_required('superadmin')
def create_admin(current_user):
    return SuperAdminController.create_admin(current_user)

@superadmin_bp.route('/delete-admin/<int:admin_id>', methods=['DELETE'])
@token_required
@role_required('superadmin')
def delete_admin(current_user, admin_id):
    return SuperAdminController.delete_user(current_user, admin_id)

@superadmin_bp.route('/users', methods=['GET'])
@token_required
@role_required('superadmin')
def get_users(current_user):
    return SuperAdminController.get_users(current_user)

@superadmin_bp.route('/statistics', methods=['GET'])
@token_required
@role_required('superadmin')
def get_statistics(current_user):
    return SuperAdminController.get_statistics(current_user)

@superadmin_bp.route('/create-department', methods=['POST'])
@token_required
@role_required('superadmin')
def create_department(current_user):
    return SuperAdminController.create_department(current_user)

@superadmin_bp.route('/create-promotion', methods=['POST'])
@token_required
@role_required('superadmin')
def create_promotion(current_user):
    return SuperAdminController.create_promotion(current_user)

@superadmin_bp.route('/update-user/<int:user_id>', methods=['PUT'])
@token_required
@role_required('superadmin')
def update_user(current_user, user_id):
    return SuperAdminController.update_user(current_user, user_id)

@superadmin_bp.route('/logs', methods=['GET'])
@token_required
@role_required('superadmin')
def get_logs(current_user):
    return SuperAdminController.get_logs(current_user)

@superadmin_bp.route('/clear-logs', methods=['DELETE'])
@token_required
@role_required('superadmin')
def clear_logs(current_user):
    return SuperAdminController.clear_logs(current_user)

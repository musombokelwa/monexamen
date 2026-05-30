from flask import Blueprint
from controllers.admin_controller import AdminController
from middleware.auth_middleware import token_required
from middleware.role_middleware import role_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/documents', methods=['GET'])
@token_required
@role_required('admin', 'superadmin')
def get_all_documents(current_user):
    return AdminController.get_all_documents(current_user)

@admin_bp.route('/approve-document', methods=['POST'])
@token_required
@role_required('admin', 'superadmin')
def approve_document(current_user):
    return AdminController.approve_document(current_user)

@admin_bp.route('/document/<int:doc_id>', methods=['DELETE'])
@token_required
@role_required('admin', 'superadmin')
def delete_document(current_user, doc_id):
    return AdminController.delete_document(current_user, doc_id)

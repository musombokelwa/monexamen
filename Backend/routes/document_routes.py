from flask import Blueprint
from controllers.document_controller import DocumentController
from middleware.auth_middleware import token_required

document_bp = Blueprint('document', __name__)

@document_bp.route('/documents', methods=['GET'])
def get_documents():
    return DocumentController.get_documents()

@document_bp.route('/documents', methods=['POST'])
@token_required
def create_document(current_user):
    return DocumentController.create_document(current_user)

@document_bp.route('/documents/<int:doc_id>', methods=['DELETE'])
@token_required
def delete_document(current_user, doc_id):
    return DocumentController.delete_document(current_user, doc_id)

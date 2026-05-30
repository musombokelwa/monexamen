from flask import request, jsonify
from models.document_model import DocumentModel

class AdminController:
    @staticmethod
    def get_all_documents(current_user):
        docs = DocumentModel.get_all_documents()
        return jsonify({'documents': docs}), 200

    @staticmethod
    def approve_document(current_user):
        data = request.get_json()
        doc_id = data.get('document_id')
        status = data.get('status')
        
        if not doc_id or not status:
            return jsonify({'message': 'document_id and status are required'}), 400
            
        doc = DocumentModel.get_document_by_id(doc_id)
        if not doc:
            return jsonify({'message': 'Document not found'}), 404
            
        DocumentModel.update_document_status(doc_id, status)
        return jsonify({'message': f'Document status updated to {status}'}), 200

    @staticmethod
    def delete_document(current_user, doc_id):
        # We can reuse the DocumentController logic here, but for simplicity we will just call the model
        # We should also delete the file in a real app, let's keep it simple for admin direct deletion
        from controllers.document_controller import DocumentController
        return DocumentController.delete_document(current_user, doc_id)

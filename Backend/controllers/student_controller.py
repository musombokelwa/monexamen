from flask import jsonify
from models.document_model import DocumentModel

class StudentController:
    @staticmethod
    def get_my_documents(current_user):
        docs = DocumentModel.get_documents_by_user(current_user['id'])
        return jsonify({'documents': docs}), 200

    @staticmethod
    def get_profile(current_user):
        user_data = dict(current_user)
        user_data.pop('password', None)
        return jsonify({'profile': user_data}), 200

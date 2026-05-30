import os
from flask import request, jsonify
from werkzeug.utils import secure_filename
from models.document_model import DocumentModel
from config import Config

class DocumentController:
    ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'}

    @staticmethod
    def allowed_file(filename):
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in DocumentController.ALLOWED_EXTENSIONS

    @staticmethod
    def get_documents(current_user=None):
        doc_type = request.args.get('type')
        if doc_type:
            if doc_type not in ['interro', 'examen']:
                return jsonify({'message': 'Invalid document type'}), 400
            docs = DocumentModel.get_documents_by_type(doc_type)
        else:
            docs = DocumentModel.get_all_documents()
        
        return jsonify({'documents': docs}), 200

    @staticmethod
    def create_document(current_user):
        if 'file' not in request.files:
            return jsonify({'message': 'No file part'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'message': 'No selected file'}), 400
            
        if file and DocumentController.allowed_file(file.filename):
            title = request.form.get('title')
            description = request.form.get('description', '')
            doc_type = request.form.get('type')
            
            if not title or not doc_type:
                return jsonify({'message': 'Title and type are required'}), 400
                
            if doc_type not in ['interro', 'examen']:
                return jsonify({'message': 'Invalid type. Must be interro or examen'}), 400

            filename = secure_filename(file.filename)
            # Save file to appropriate directory
            save_dir = os.path.join(Config.UPLOAD_FOLDER, doc_type)
            os.makedirs(save_dir, exist_ok=True)
            file_path = os.path.join(save_dir, filename)
            
            # To avoid overwriting, you might want to prepend a timestamp, but this is fine for now
            file.save(file_path)
            
            # Save relative path to DB
            rel_path = f'documents/{doc_type}/{filename}'
            
            # Parse extra fields
            promotion_id = request.form.get('promotion_id')
            department_id = request.form.get('department_id') or None
            subject = request.form.get('subject', '')
            year = request.form.get('year', '')
            session = request.form.get('session', '')
            
            # File info
            file_url = rel_path
            file_name = filename
            
            # Calculate file size
            file.seek(0, os.SEEK_END)
            file_size_bytes = file.tell()
            file.seek(0, 0)
            if file_size_bytes < 1024 * 1024:
                file_size = f"{file_size_bytes / 1024:.1f} KB"
            else:
                file_size = f"{file_size_bytes / (1024 * 1024):.1f} MB"
                
            added_by = current_user['id']
            
            doc_id = DocumentModel.create_document(
                title, doc_type, subject, promotion_id, department_id, 
                year, session, file_url, file_name, file_size, 
                description, added_by
            )
            
            if not doc_id:
                return jsonify({'message': 'Database error'}), 500
                
            return jsonify({'message': 'Document uploaded successfully', 'id': doc_id}), 201
            
        return jsonify({'message': 'File type not allowed'}), 400

    @staticmethod
    def delete_document(current_user, doc_id):
        doc = DocumentModel.get_document_by_id(doc_id)
        if not doc:
            return jsonify({'message': 'Document not found'}), 404
            
        # Optional: check if the user is allowed to delete this (e.g., admin or owner)
        if current_user['role'] == 'student' and doc.get('added_by') != current_user['id']:
            return jsonify({'message': 'Unauthorized'}), 403
            
        # Delete file from disk
        if doc.get('file_url'):
            abs_file_path = os.path.join(Config.UPLOAD_FOLDER, '..', doc['file_url'])
            if os.path.exists(abs_file_path):
                os.remove(abs_file_path)
            
        DocumentModel.delete_document(doc_id)
        return jsonify({'message': 'Document deleted successfully'}), 200

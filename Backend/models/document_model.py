from database.db import (
    create_document as db_create_document,
    get_all_documents as db_get_all_documents,
    get_document_by_id as db_get_document_by_id,
    get_documents_by_promotion as db_get_documents_by_promotion,
    get_documents_by_user as db_get_documents_by_user,
    get_documents_by_type as db_get_documents_by_type,
    update_document_status as db_update_document_status,
    delete_document as db_delete_document
)

class DocumentModel:
    @staticmethod
    def create_document(title, doc_type, subject, promotion_id, department_id, year, session, file_url, file_name, file_size, description, added_by):
        return db_create_document(title, doc_type, subject, promotion_id, department_id, year, session, file_url, file_name, file_size, description, added_by)

    @staticmethod
    def get_documents_by_type(doc_type):
        return db_get_documents_by_type(doc_type)

    @staticmethod
    def get_all_documents():
        return db_get_all_documents()

    @staticmethod
    def get_documents_by_user(user_id):
        return db_get_documents_by_user(user_id)

    @staticmethod
    def get_document_by_id(doc_id):
        return db_get_document_by_id(doc_id)

    @staticmethod
    def delete_document(doc_id):
        db_delete_document(doc_id)

    @staticmethod
    def update_document_status(doc_id, status, approved_by=None):
        db_update_document_status(doc_id, status, approved_by)

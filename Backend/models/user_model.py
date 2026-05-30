from database.db import (
    get_user_by_email, get_user_by_id, get_all_users,
    create_user as db_create_user, update_user as db_update_user,
    delete_user as db_delete_user
)
from utils.helpers import hash_password

class UserModel:
    @staticmethod
    def get_user_by_email(email):
        return get_user_by_email(email)

    @staticmethod
    def get_user_by_id(user_id):
        return get_user_by_id(user_id)

    @staticmethod
    def get_all_users():
        return get_all_users()

    @staticmethod
    def create_user(fullname, email, password, role='student', promotion_id=None, department_id=None):
        hashed = hash_password(password)
        return db_create_user(fullname, email, hashed, role, promotion_id, department_id)

    @staticmethod
    def update_user(user_id, updates):
        """Update user fields. If 'password' is in updates, hash it first."""
        if 'password' in updates and updates['password']:
            updates['password'] = hash_password(updates['password'])
        db_update_user(user_id, updates)

    @staticmethod
    def delete_user(user_id):
        db_delete_user(user_id)

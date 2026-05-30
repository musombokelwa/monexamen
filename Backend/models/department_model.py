from database.db import get_all_departments, create_department as db_create_department

class DepartmentModel:
    @staticmethod
    def create_department(name):
        return db_create_department(name)

    @staticmethod
    def get_all_departments():
        return get_all_departments()

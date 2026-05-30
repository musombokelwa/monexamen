from flask import Blueprint
from controllers.student_controller import StudentController
from middleware.auth_middleware import token_required
from middleware.role_middleware import role_required

student_bp = Blueprint('student', __name__)

@student_bp.route('/documents', methods=['GET'])
@token_required
@role_required('student')
def get_student_documents(current_user):
    return StudentController.get_my_documents(current_user)

@student_bp.route('/profile', methods=['GET'])
@token_required
@role_required('student')
def get_student_profile(current_user):
    return StudentController.get_profile(current_user)

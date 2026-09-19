import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db, User, Order, OrderFile

files_bp = Blueprint("files", __name__)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def user_can_access_order(user, order):
    if user.role == "employer":
        return order.employer_id == user.id
    if user.role == "bidder":
        return order.bidder_id == user.id
    if user.role == "writer":
        return order.writer_id == user.id
    return False


@files_bp.post("/orders/<int:order_id>/files")
@jwt_required()
def upload_file(order_id):
    order = Order.query.get_or_404(order_id)
    user = User.query.get(int(get_jwt_identity()))

    if not user_can_access_order(user, order):
        return jsonify({"error": "You don't have access to this order."}), 403

    if "file" not in request.files:
        return jsonify({"error": "No file provided."}), 400

    upload = request.files["file"]
    if upload.filename == "":
        return jsonify({"error": "No file selected."}), 400

    original_name = upload.filename
    ext = os.path.splitext(original_name)[1]
    stored_name = f"{uuid.uuid4().hex}{ext}"
    save_path = os.path.join(UPLOAD_DIR, stored_name)
    upload.save(save_path)

    file_record = OrderFile(
        order_id=order.id,
        uploaded_by_id=user.id,
        original_filename=original_name,
        stored_filename=stored_name,
        file_size=os.path.getsize(save_path),
    )
    db.session.add(file_record)
    db.session.commit()

    return jsonify(file_record.to_dict()), 201


@files_bp.get("/orders/<int:order_id>/files")
@jwt_required()
def list_files(order_id):
    order = Order.query.get_or_404(order_id)
    user = User.query.get(int(get_jwt_identity()))

    if not user_can_access_order(user, order):
        return jsonify({"error": "You don't have access to this order."}), 403

    files = OrderFile.query.filter_by(order_id=order_id).order_by(OrderFile.uploaded_at.desc()).all()
    return jsonify([f.to_dict() for f in files])


@files_bp.get("/files/<int:file_id>/download")
@jwt_required()
def download_file(file_id):
    file_record = OrderFile.query.get_or_404(file_id)
    order = Order.query.get(file_record.order_id)
    user = User.query.get(int(get_jwt_identity()))

    if not user_can_access_order(user, order):
        return jsonify({"error": "You don't have access to this file."}), 403

    return send_from_directory(
        UPLOAD_DIR,
        file_record.stored_filename,
        as_attachment=True,
        download_name=file_record.original_filename,
    )


@files_bp.delete("/files/<int:file_id>")
@jwt_required()
def delete_file(file_id):
    file_record = OrderFile.query.get_or_404(file_id)
    user = User.query.get(int(get_jwt_identity()))

    if file_record.uploaded_by_id != user.id:
        return jsonify({"error": "You can only delete files you uploaded."}), 403

    path = os.path.join(UPLOAD_DIR, file_record.stored_filename)
    if os.path.exists(path):
        os.remove(path)

    db.session.delete(file_record)
    db.session.commit()
    return jsonify({"deleted": file_id})

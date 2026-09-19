from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Order, OrderComment

comments_bp = Blueprint("comments", __name__)


def user_can_access_order(user, order):
    if user.role == "employer":
        return order.employer_id == user.id
    if user.role == "bidder":
        return order.bidder_id == user.id
    if user.role == "writer":
        return order.writer_id == user.id
    return False


@comments_bp.get("/orders/<int:order_id>/comments")
@jwt_required()
def list_comments(order_id):
    order = Order.query.get_or_404(order_id)
    user = User.query.get(int(get_jwt_identity()))

    if not user_can_access_order(user, order):
        return jsonify({"error": "You don't have access to this order."}), 403

    comments = OrderComment.query.filter_by(order_id=order_id).order_by(OrderComment.created_at.asc()).all()
    return jsonify([c.to_dict() for c in comments])


@comments_bp.post("/orders/<int:order_id>/comments")
@jwt_required()
def add_comment(order_id):
    order = Order.query.get_or_404(order_id)
    user = User.query.get(int(get_jwt_identity()))

    if not user_can_access_order(user, order):
        return jsonify({"error": "You don't have access to this order."}), 403

    data = request.get_json(force=True) or {}
    body = (data.get("body") or "").strip()
    if not body:
        return jsonify({"error": "Comment can't be empty."}), 400

    comment = OrderComment(order_id=order_id, author_id=user.id, body=body)
    db.session.add(comment)
    db.session.commit()
    return jsonify(comment.to_dict()), 201

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Notification
from sockets import socketio

notifications_bp = Blueprint("notifications", __name__)


def create_notification(user_id, message, order_id=None):
    notification = Notification(user_id=user_id, message=message, order_id=order_id)
    db.session.add(notification)
    db.session.commit()

    socketio.emit(
        "notification",
        notification.to_dict(),
        room=f"user_{user_id}",
    )
    return notification


@notifications_bp.get("/notifications")
@jwt_required()
def list_notifications():
    user_id = int(get_jwt_identity())
    notifications = (
        Notification.query.filter_by(user_id=user_id)
        .order_by(Notification.created_at.desc())
        .limit(30)
        .all()
    )
    unread_count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    return jsonify({
        "notifications": [n.to_dict() for n in notifications],
        "unread_count": unread_count,
    })


@notifications_bp.post("/notifications/<int:notification_id>/read")
@jwt_required()
def mark_read(notification_id):
    user_id = int(get_jwt_identity())
    notification = Notification.query.get_or_404(notification_id)
    if notification.user_id != user_id:
        return jsonify({"error": "Not your notification."}), 403

    notification.is_read = True
    db.session.commit()
    return jsonify(notification.to_dict())


@notifications_bp.post("/notifications/read-all")
@jwt_required()
def mark_all_read():
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"status": "ok"})

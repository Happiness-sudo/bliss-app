from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db, User, Order
from routes.notifications import create_notification

orders_bp = Blueprint("orders", __name__)


def current_user():
    return User.query.get(int(get_jwt_identity()))


@orders_bp.post("/orders")
@jwt_required()
def create_order():
    claims = get_jwt()
    if claims.get("role") != "bidder":
        return jsonify({"error": "Only bidders can create orders."}), 403

    bidder = current_user()
    data = request.get_json(force=True) or {}

    order_number = (data.get("order_number") or "").strip()
    instructions = (data.get("instructions") or "").strip()
    writer_id = data.get("writer_id")

    if not order_number or not instructions:
        return jsonify({"error": "Order number and instructions are required."}), 400
    if Order.query.filter_by(order_number=order_number).first():
        return jsonify({"error": "That order number is already in use."}), 409

    writer = None
    if writer_id:
        writer = User.query.get(writer_id)
        if not writer or writer.role != "writer" or writer.employer_id != bidder.employer_id:
            return jsonify({"error": "Invalid writer selected."}), 400

    deadline_str = data.get("deadline")
    deadline = None
    if deadline_str:
        try:
            deadline = datetime.fromisoformat(deadline_str)
        except ValueError:
            return jsonify({"error": "Invalid deadline format."}), 400

    order = Order(
        order_number=order_number,
        employer_id=bidder.employer_id,
        bidder_id=bidder.id,
        writer_id=writer.id if writer else None,
        instructions=instructions,
        page_count=int(data.get("page_count", 0) or 0),
        payment_amount=float(data.get("payment_amount", 0) or 0),
        deadline=deadline,
        status="assigned",
    )
    db.session.add(order)
    db.session.commit()

    if writer:
        create_notification(
            writer.id,
            f"New order #{order.order_number} assigned to you.",
            order_id=order.id,
        )

    return jsonify(order.to_dict()), 201


@orders_bp.post("/orders/<int:order_id>/assign")
@jwt_required()
def assign_writer(order_id):
    claims = get_jwt()
    if claims.get("role") != "bidder":
        return jsonify({"error": "Only bidders can assign writers."}), 403

    order = Order.query.get_or_404(order_id)
    if order.bidder_id != int(get_jwt_identity()):
        return jsonify({"error": "This isn't your order."}), 403

    data = request.get_json(force=True) or {}
    writer = User.query.get(data.get("writer_id"))
    if not writer or writer.role != "writer" or writer.employer_id != order.employer_id:
        return jsonify({"error": "Invalid writer selected."}), 400

    order.writer_id = writer.id
    order.status = "assigned"
    db.session.commit()

    create_notification(
        writer.id,
        f"Order #{order.order_number} assigned to you.",
        order_id=order.id,
    )

    return jsonify(order.to_dict())


@orders_bp.post("/orders/<int:order_id>/submit")
@jwt_required()
def submit_work(order_id):
    claims = get_jwt()
    if claims.get("role") != "writer":
        return jsonify({"error": "Only writers can submit work."}), 403

    order = Order.query.get_or_404(order_id)
    if order.writer_id != int(get_jwt_identity()):
        return jsonify({"error": "This order isn't assigned to you."}), 403

    data = request.get_json(force=True) or {}
    order.submission_text = data.get("submission_text", "")
    order.status = "submitted"
    db.session.commit()

    create_notification(
        order.bidder_id,
        f"Order #{order.order_number} was submitted for review.",
        order_id=order.id,
    )

    return jsonify(order.to_dict())


@orders_bp.post("/orders/<int:order_id>/status")
@jwt_required()
def update_status(order_id):
    claims = get_jwt()
    if claims.get("role") != "bidder":
        return jsonify({"error": "Only bidders can update order status."}), 403

    order = Order.query.get_or_404(order_id)
    if order.bidder_id != int(get_jwt_identity()):
        return jsonify({"error": "This isn't your order."}), 403

    data = request.get_json(force=True) or {}
    new_status = data.get("status")
    valid = ["assigned", "in_progress", "submitted", "under_review", "sent_to_client", "paid"]
    if new_status not in valid:
        return jsonify({"error": "Invalid status."}), 400

    order.status = new_status
    order.submission_notes = data.get("submission_notes", order.submission_notes)
    if new_status == "paid":
        order.is_paid = True
    db.session.commit()

    if new_status == "paid":
        create_notification(
            order.employer_id,
            f"Order #{order.order_number} was marked paid.",
            order_id=order.id,
        )

    return jsonify(order.to_dict())


@orders_bp.get("/dashboard/writer")
@jwt_required()
def writer_dashboard():
    claims = get_jwt()
    if claims.get("role") != "writer":
        return jsonify({"error": "Writers only."}), 403

    writer_id = int(get_jwt_identity())
    orders = Order.query.filter_by(writer_id=writer_id).order_by(Order.created_at.desc()).all()

    return jsonify({
        "orders": [o.to_dict() for o in orders],
        "stats": {
            "total": len(orders),
            "in_progress": len([o for o in orders if o.status in ("assigned", "in_progress")]),
            "submitted": len([o for o in orders if o.status == "submitted"]),
            "completed": len([o for o in orders if o.status in ("sent_to_client", "paid")]),
        },
    })


@orders_bp.get("/dashboard/bidder")
@jwt_required()
def bidder_dashboard():
    claims = get_jwt()
    if claims.get("role") != "bidder":
        return jsonify({"error": "Bidders only."}), 403

    bidder = current_user()
    orders = Order.query.filter_by(bidder_id=bidder.id).order_by(Order.created_at.desc()).all()
    writers = User.query.filter_by(employer_id=bidder.employer_id, role="writer").all()

    return jsonify({
        "orders": [o.to_dict() for o in orders],
        "writers": [w.to_dict() for w in writers],
        "stats": {
            "total_orders": len(orders),
            "awaiting_review": len([o for o in orders if o.status == "submitted"]),
            "paid": len([o for o in orders if o.is_paid]),
            "total_earned": sum(o.payment_amount for o in orders if o.is_paid),
        },
    })


@orders_bp.get("/dashboard/employer")
@jwt_required()
def employer_dashboard():
    claims = get_jwt()
    if claims.get("role") != "employer":
        return jsonify({"error": "Employers only."}), 403

    employer_id = int(get_jwt_identity())
    orders = Order.query.filter_by(employer_id=employer_id).order_by(Order.created_at.desc()).all()

    return jsonify({
        "orders": [o.to_dict() for o in orders],
        "stats": {
            "total_orders": len(orders),
            "paid": len([o for o in orders if o.is_paid]),
            "unpaid": len([o for o in orders if not o.is_paid]),
            "total_revenue": sum(o.payment_amount for o in orders if o.is_paid),
        },
    })


@orders_bp.get("/orders/<int:order_id>")
@jwt_required()
def get_order(order_id):
    claims = get_jwt()
    order = Order.query.get_or_404(order_id)
    user = current_user()

    allowed = (
        (claims.get("role") == "employer" and order.employer_id == user.id) or
        (claims.get("role") == "bidder" and order.bidder_id == user.id) or
        (claims.get("role") == "writer" and order.writer_id == user.id)
    )
    if not allowed:
        return jsonify({"error": "You don't have access to this order."}), 403

    return jsonify(order.to_dict())

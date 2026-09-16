from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db, User

team_bp = Blueprint("team", __name__)


def require_employer(claims):
    return claims.get("role") == "employer"


@team_bp.post("/team")
@jwt_required()
def add_team_member():
    claims = get_jwt()
    if not require_employer(claims):
        return jsonify({"error": "Only employers can add team members."}), 403

    data = request.get_json(force=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = data.get("role")

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required."}), 400
    if role not in ("bidder", "writer"):
        return jsonify({"error": "Role must be 'bidder' or 'writer'."}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists."}), 409

    employer_id = int(get_jwt_identity())
    member = User(name=name, email=email, role=role, employer_id=employer_id)
    member.set_password(password)
    db.session.add(member)
    db.session.commit()

    return jsonify(member.to_dict()), 201


@team_bp.get("/team")
@jwt_required()
def list_team():
    claims = get_jwt()
    if not require_employer(claims):
        return jsonify({"error": "Only employers can view their team."}), 403

    employer_id = int(get_jwt_identity())
    bidders = User.query.filter_by(employer_id=employer_id, role="bidder").all()
    writers = User.query.filter_by(employer_id=employer_id, role="writer").all()

    return jsonify({
        "bidders": [b.to_dict() for b in bidders],
        "writers": [w.to_dict() for w in writers],
    })


@team_bp.delete("/team/<int:user_id>")
@jwt_required()
def remove_team_member(user_id):
    claims = get_jwt()
    if not require_employer(claims):
        return jsonify({"error": "Only employers can remove team members."}), 403

    employer_id = int(get_jwt_identity())
    member = User.query.get_or_404(user_id)
    if member.employer_id != employer_id:
        return jsonify({"error": "This person isn't on your team."}), 403

    db.session.delete(member)
    db.session.commit()
    return jsonify({"deleted": user_id})

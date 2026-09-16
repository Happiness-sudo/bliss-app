from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

ORDER_STATUSES = [
    "assigned",
    "in_progress",
    "submitted",
    "under_review",
    "sent_to_client",
    "paid",
]


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'employer', 'bidder', 'writer'
    employer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "employer_id": self.employer_id,
            "created_at": self.created_at.isoformat(),
        }


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(80), unique=True, nullable=False, index=True)
    employer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    bidder_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    writer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    instructions = db.Column(db.Text, nullable=False)
    page_count = db.Column(db.Integer, default=0)
    deadline = db.Column(db.DateTime, nullable=True)

    payment_amount = db.Column(db.Float, default=0.0)
    is_paid = db.Column(db.Boolean, default=False)

    status = db.Column(db.String(20), default="assigned")

    submission_text = db.Column(db.Text, default="")
    submission_notes = db.Column(db.Text, default="")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    employer = db.relationship("User", foreign_keys=[employer_id])
    bidder = db.relationship("User", foreign_keys=[bidder_id])
    writer = db.relationship("User", foreign_keys=[writer_id])

    def to_dict(self):
        return {
            "id": self.id,
            "order_number": self.order_number,
            "employer_id": self.employer_id,
            "bidder_id": self.bidder_id,
            "bidder_name": self.bidder.name if self.bidder else None,
            "writer_id": self.writer_id,
            "writer_name": self.writer.name if self.writer else None,
            "instructions": self.instructions,
            "page_count": self.page_count,
            "deadline": self.deadline.isoformat() if self.deadline else None,
            "payment_amount": self.payment_amount,
            "is_paid": self.is_paid,
            "status": self.status,
            "submission_text": self.submission_text,
            "submission_notes": self.submission_notes,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from models import db
from routes.auth import auth_bp
from routes.team import team_bp
from routes.orders import orders_bp
from sockets import socketio


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    JWTManager(app)
    socketio.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(team_bp, url_prefix="/api")
    app.register_blueprint(orders_bp, url_prefix="/api")

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    socketio.run(app, debug=True, port=5000)

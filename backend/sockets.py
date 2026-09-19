from flask_socketio import SocketIO, join_room
from flask_jwt_extended import decode_token
from flask import request
from models import User

socketio = SocketIO(cors_allowed_origins="*", async_mode="threading")

online_counts = {}


def get_team_room(user):
    employer_id = user.id if user.role == "employer" else user.employer_id
    return f"team_{employer_id}"


@socketio.on("connect")
def handle_connect(auth):
    token = (auth or {}).get("token")
    if not token:
        return False

    try:
        decoded = decode_token(token)
        user_id = int(decoded["sub"])
    except Exception:
        return False

    user = User.query.get(user_id)
    if not user:
        return False

    room = get_team_room(user)
    join_room(room)

    online_counts[user_id] = online_counts.get(user_id, 0) + 1
    if online_counts[user_id] == 1:
        socketio.emit("presence_update", {"user_id": user_id, "online": True}, room=room)

    request.sid_user_id = user_id
    request.sid_room = room


@socketio.on("disconnect")
def handle_disconnect():
    user_id = getattr(request, "sid_user_id", None)
    room = getattr(request, "sid_room", None)
    if user_id is None:
        return

    online_counts[user_id] = max(0, online_counts.get(user_id, 1) - 1)
    if online_counts[user_id] == 0:
        socketio.emit("presence_update", {"user_id": user_id, "online": False}, room=room)


@socketio.on("who_is_online")
def handle_who_is_online():
    room = getattr(request, "sid_room", None)
    if not room:
        return
    online_ids = [uid for uid, count in online_counts.items() if count > 0]
    socketio.emit("online_list", {"user_ids": online_ids}, room=room)

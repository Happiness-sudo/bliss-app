import { useEffect, useState } from "react";
import { getSocket } from "../socket";

export default function PresenceDot({ userId }) {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function handlePresence({ user_id, online }) {
      if (user_id === userId) setOnline(online);
    }

    function handleOnlineList({ user_ids }) {
      if (user_ids.includes(userId)) setOnline(true);
    }

    socket.on("presence_update", handlePresence);
    socket.on("online_list", handleOnlineList);
    socket.emit("who_is_online");

    return () => {
      socket.off("presence_update", handlePresence);
      socket.off("online_list", handleOnlineList);
    };
  }, [userId]);

  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${online ? "bg-sage" : "bg-line"}`}
      title={online ? "Online" : "Offline"}
    />
  );
}

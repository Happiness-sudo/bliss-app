import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { getSocket } from "../socket";

function timeAgo(iso) {
  const seconds = Math.floor((new Date() - new Date(iso)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  async function load() {
    try {
      const data = await api.listNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    load();

    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function handleNewNotification(notification) {
      setNotifications((prev) => [notification, ...prev].slice(0, 30));
      setUnreadCount((prev) => prev + 1);
    }

    socket.on("notification", handleNewNotification);
    return () => socket.off("notification", handleNewNotification);
  }, []);

  async function handleOpen() {
    setOpen(!open);
  }

  async function handleMarkAllRead() {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleNotificationClick(notification) {
    if (!notification.is_read) {
      try {
        await api.markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
    setOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={handleOpen} className="relative rounded-md border border-line dark:border-[#333b47] px-3 py-1.5 text-sm text-charcoal dark:text-[#c9c2b0] hover:border-amber hover:text-amber">
        Notifications
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber px-1 text-[10px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded border border-line dark:border-[#333b47] bg-white shadow-lg z-10">
          <div className="flex items-center justify-between border-b border-line dark:border-[#333b47] px-4 py-2">
            <span className="text-sm text-ink dark:text-[#e9e4d8]">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-amber hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-charcoal/50 dark:text-[#c9c2b0]/50">No notifications yet.</p>
            )}
            {notifications.map((n) => {
              const content = (
                <div
                  className={`border-b border-line dark:border-[#333b47] px-4 py-3 text-sm last:border-b-0 ${
                    n.is_read ? "bg-white" : "bg-amber/5"
                  }`}
                >
                  <p className="text-charcoal/85 dark:text-[#c9c2b0]/85">{n.message}</p>
                  <p className="mt-1 text-xs text-charcoal/40 dark:text-[#c9c2b0]/40">{timeAgo(n.created_at)}</p>
                </div>
              );
              return n.order_id ? (
                <Link key={n.id} to={`/orders/${n.order_id}`} onClick={() => handleNotificationClick(n)} className="block hover:bg-paper dark:bg-[#14181f]">
                  {content}
                </Link>
              ) : (
                <div key={n.id} onClick={() => handleNotificationClick(n)} className="cursor-pointer hover:bg-paper dark:bg-[#14181f]">
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

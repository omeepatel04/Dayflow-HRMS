import { useState, useEffect } from "react";
import { Bell, Check, X, Filter } from "lucide-react";
import { notificationsAPI } from "../services";
import { cn } from "../utils/cn";

const BORDER_SOFT = "border-[rgba(117,81,108,0.18)]";
const CHIP_BG = "bg-[#fef4f7]";

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const params = filter === "unread" ? { unread: true } : {};
      const data = await notificationsAPI.getMyNotifications(params);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500";
      case "HIGH":
        return "bg-orange-500";
      case "MEDIUM":
        return "bg-blue-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-2xl border border-[rgba(117,81,108,0.2)] bg-white/80 p-2 text-[#75516c] hover:bg-white"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-3xl border border-[rgba(117,81,108,0.2)] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[rgba(117,81,108,0.1)] p-4">
              <h3 className="text-lg font-semibold text-[#2f1627]">
                Notifications
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter(filter === "all" ? "unread" : "all")}
                  className={cn(
                    "rounded-xl px-3 py-1 text-xs transition",
                    filter === "unread"
                      ? "bg-[#75516c] text-white"
                      : "bg-[#fef4f7] text-[#75516c]"
                  )}
                >
                  <Filter className="inline h-3 w-3 mr-1" />
                  {filter === "all" ? "All" : "Unread"}
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="rounded-xl bg-[#fef4f7] px-3 py-1 text-xs text-[#75516c] hover:bg-[#f6e5ed]"
                  >
                    <Check className="inline h-3 w-3 mr-1" />
                    Mark all
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      "border-b border-[rgba(117,81,108,0.1)] p-4 transition hover:bg-[#fef4f7]",
                      !notif.is_read && "bg-[#fff9fb]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              getPriorityColor(notif.priority)
                            )}
                          />
                          <h4 className="font-semibold text-sm text-[#2f1627]">
                            {notif.title}
                          </h4>
                        </div>
                        <p className="mt-1 text-xs text-[#7f5a6f]">
                          {notif.message}
                        </p>
                        <p className="mt-2 text-xs text-[#b28fa1]">
                          {notif.time_ago}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="text-[#b28fa1] hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-[#7f5a6f]">
                  No notifications
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;

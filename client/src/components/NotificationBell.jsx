import { useState, useEffect, useRef } from "react";
import { Bell, Check, X, Filter } from "lucide-react";
import { notificationsAPI } from "../services";
import { cn } from "../utils/cn";
import { useToast } from "./Toast";

const BORDER_SOFT = "border-[rgba(117,81,108,0.18)]";
const CHIP_BG = "bg-[#fef4f7]";

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { pushToast } = useToast();
  const notifiedErrorRef = useRef(false);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const params = filter === "unread" ? { unread_only: true } : {};
      const response = await notificationsAPI.getMyNotifications(params);
      // Backend returns { count, unread_count, notifications }
      const notificationsData = response?.notifications || response || [];
      const unreadCountData = response?.unread_count ?? 0;
      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
      notifiedErrorRef.current = false;
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Unable to load notifications.");
      setNotifications([]);
      if (!notifiedErrorRef.current) {
        pushToast({
          title: "Notifications not available",
          description: "We could not refresh notifications. Please retry.",
          variant: "error",
        });
        notifiedErrorRef.current = true;
      }
    }
    setLoading(false);
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      pushToast({ title: "Marked all as read", variant: "success" });
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      pushToast({
        title: "Could not mark all",
        description: "Please try again in a moment.",
        variant: "error",
      });
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      pushToast({ title: "Notification removed", variant: "success" });
    } catch (err) {
      console.error("Failed to delete notification:", err);
      pushToast({
        title: "Delete failed",
        description: "We could not delete this notification.",
        variant: "error",
      });
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
                  onClick={fetchNotifications}
                  disabled={loading}
                  className="rounded-xl bg-[#fef4f7] px-3 py-1 text-xs text-[#75516c] hover:bg-[#f6e5ed] disabled:opacity-50"
                >
                  Refresh
                </button>
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
              {error ? (
                <div className="p-8 text-center text-sm text-red-600">
                  {error}
                </div>
              ) : loading ? (
                <div className="space-y-2 p-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-2xl bg-[#fef4f7]"
                    />
                  ))}
                </div>
              ) : notifications.length > 0 ? (
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

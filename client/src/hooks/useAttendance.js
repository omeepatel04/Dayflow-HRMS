import { useState, useEffect, useCallback } from "react";
import { attendanceAPI } from "../services";

/**
 * Custom hook for attendance management
 * Handles check-in, check-out, and attendance status
 */
export const useAttendance = () => {
  const [status, setStatus] = useState("checked_out"); // checked_in, checked_out, loading
  const [history, setHistory] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch today's attendance status
  const fetchTodayAttendance = useCallback(async () => {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      const params = { from_date: todayStr, to_date: todayStr };

      const response = await attendanceAPI.getMyAttendance(params);
      // Backend returns { count, attendance }, extract attendance array
      const attendanceData = response?.attendance || response || [];

      // Prefer today's record; otherwise fall back to most recent
      const attendance =
        attendanceData.find((item) => item.date === todayStr) ||
        attendanceData
          .slice()
          .sort(
            (a, b) =>
              new Date(`${a.date}T${a.check_in_time || "00:00"}`) -
              new Date(`${b.date}T${b.check_in_time || "00:00"}`)
          )
          .pop();

      if (attendance) {
        setTodayAttendance(attendance);

        // Determine status based on check_out_time
        if (attendance.check_out_time) {
          setStatus("checked_out");
          setHistory([
            { type: "check_in", timestamp: attendance.check_in_time },
            { type: "check_out", timestamp: attendance.check_out_time },
          ]);
        } else {
          setStatus("checked_in");
          setHistory([
            { type: "check_in", timestamp: attendance.check_in_time },
          ]);
        }
      } else {
        setStatus("checked_out");
        setTodayAttendance(null);
        setHistory([]);
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
      setStatus("checked_out");
    }
  }, []);

  // Check-in
  const checkIn = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await attendanceAPI.checkIn();
      // Backend returns { message, attendance }
      const attendance = response?.attendance || response;

      setTodayAttendance(attendance);
      setStatus("checked_in");
      setHistory([{ type: "check_in", timestamp: attendance.check_in_time }]);

      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Check-in failed";
      setError(errorMessage);

      // If backend says we're already checked in, reflect that immediately
      if (errorMessage.toLowerCase().includes("already checked in")) {
        setStatus("checked_in");
      }

      // Refresh status to reflect any existing record (e.g., already checked in)
      await fetchTodayAttendance();
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Check-out
  const checkOut = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await attendanceAPI.checkOut();
      // Backend returns { message, attendance }
      const attendance = response?.attendance || response;

      setTodayAttendance(attendance);
      setStatus("checked_out");
      setHistory((prev) => [
        ...prev,
        { type: "check_out", timestamp: attendance.check_out_time },
      ]);

      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Check-out failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Load attendance status on mount
  useEffect(() => {
    fetchTodayAttendance();
  }, [fetchTodayAttendance]);

  return {
    status,
    history,
    todayAttendance,
    loading,
    error,
    checkIn,
    checkOut,
    refetch: fetchTodayAttendance,
    lastCheckIn: todayAttendance?.check_in_time,
    lastCheckOut: todayAttendance?.check_out_time,
    setOnLeave: () => setStatus("on_leave"), // Compatibility
  };
};

export default useAttendance;

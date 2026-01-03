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
      const params = {
        start_date: today.toISOString().split("T")[0],
        end_date: today.toISOString().split("T")[0],
      };

      const response = await attendanceAPI.getMyAttendance(params);

      if (response.length > 0) {
        const attendance = response[0];
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

      setTodayAttendance(response);
      setStatus("checked_in");
      setHistory([{ type: "check_in", timestamp: response.check_in_time }]);

      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Check-in failed";
      setError(errorMessage);
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

      setTodayAttendance(response);
      setStatus("checked_out");
      setHistory((prev) => [
        ...prev,
        { type: "check_out", timestamp: response.check_out_time },
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

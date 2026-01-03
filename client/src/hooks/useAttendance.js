import { useState, useEffect } from 'react';
import api from '../services/api';

export const useAttendance = () => {
    const [status, setStatus] = useState(null); // 'Present', 'Absent', etc.
    const [loading, setLoading] = useState(false);

    // Fetch today's status when the component loads
    const fetchTodayStatus = async () => {
        try {
            const response = await api.get('/attendance/today/');
            setStatus(response.data.status);
        } catch (err) {
            console.error("Failed to fetch attendance", err);
        }
    };

    // The "Check In" Button Logic
    const checkIn = async () => {
        setLoading(true);
        try {
            // Posting to Postgres via Django
            const response = await api.post('/attendance/check-in/');
            setStatus('Present');
            return response.data;
        } catch (err) {
            alert(err.response?.data?.message || "Check-in failed");
        } finally {
            setLoading(false);
        }
    };

    // The "Check Out" Button Logic
    const checkOut = async () => {
        setLoading(true);
        try {
            const response = await api.post('/attendance/check-out/');
            setStatus('Checked Out');
            return response.data;
        } catch (err) {
            alert("Check-out failed");
        } finally {
            setLoading(false);
        }
    };

    return { status, checkIn, checkOut, fetchTodayStatus, loading };
};
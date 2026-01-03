import { useState, useEffect } from 'react';

const STORAGE_KEY = 'dayflow:attendance';
const initialSnapshot = {
    status: 'checked_out',
    lastCheckIn: null,
    lastCheckOut: null,
    history: [],
};

export const useAttendance = () => {
    const [snapshot, setSnapshot] = useState(() => {
        try {
            const cached = localStorage.getItem(STORAGE_KEY);
            return cached ? JSON.parse(cached) : initialSnapshot;
        } catch (error) {
            console.warn('Failed to parse attendance cache', error);
            return initialSnapshot;
        }
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    }, [snapshot]);

    const mutate = (recipe) =>
        new Promise((resolve) => {
            setLoading(true);
            setTimeout(() => {
                let computed = snapshot;
                setSnapshot((prev) => {
                    const patch = typeof recipe === 'function' ? recipe(prev) : recipe;
                    computed = { ...prev, ...patch };
                    return computed;
                });
                setLoading(false);
                resolve(computed);
            }, 650);
        });

    const appendHistory = (entry) => (prev) => ({
        history: [entry, ...prev.history].slice(0, 6),
    });

    const checkIn = async () => {
        const timestamp = new Date().toISOString();
        await mutate((prev) => ({
            status: 'checked_in',
            lastCheckIn: timestamp,
            ...appendHistory({ type: 'check_in', timestamp })(prev),
        }));
        return timestamp;
    };

    const checkOut = async () => {
        const timestamp = new Date().toISOString();
        await mutate((prev) => ({
            status: 'checked_out',
            lastCheckOut: timestamp,
            ...appendHistory({ type: 'check_out', timestamp })(prev),
        }));
        return timestamp;
    };

    const setOnLeave = async () => {
        await mutate({ status: 'on_leave' });
    };

    return {
        status: snapshot.status,
        lastCheckIn: snapshot.lastCheckIn,
        lastCheckOut: snapshot.lastCheckOut,
        history: snapshot.history,
        loading,
        checkIn,
        checkOut,
        setOnLeave,
    };
};
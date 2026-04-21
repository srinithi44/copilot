import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';

export default function StatePersister() {
    const location = useLocation();
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;

        // Skip auth pages or generic pages we don't want to restore to
        const ignoredPaths = ['/login', '/signup', '/email-verify', '/otp-verify', '/forgot-password'];
        if (ignoredPaths.includes(location.pathname)) return;

        const saveState = async () => {
            try {
                await fetch(`${API_BASE_URL}/auth/update-state`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: currentUser.uid,
                        lastActivePath: location.pathname + location.search
                    })
                });
            } catch (e) {
                // Silent fail is fine for this feature
                console.error("Failed to save state", e);
            }
        };

        // Debounce to avoid excessive calls during rapid navigation
        const timer = setTimeout(saveState, 2000);
        return () => clearTimeout(timer);

    }, [location, currentUser]);

    return null;
}

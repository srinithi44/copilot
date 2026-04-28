import React, { createContext, useContext, useEffect, useState } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    signInAnonymously
} from "firebase/auth";
import { auth } from "../config/firebase";
import Spinner from "../components/Spinner";
import { API_BASE_URL } from "../config/api";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // Initialize from storage to avoid re-verify on refresh
    const [is2faVerified, setIs2faVerifiedState] = useState(() => {
        try {
            return window.sessionStorage.getItem('is2faVerified') === 'true';
        } catch {
            return false;
        }
    });

    function setIs2faVerified(status) {
        setIs2faVerifiedState(status);
        if (status) {
            window.sessionStorage.setItem('is2faVerified', 'true');
        } else {
            window.sessionStorage.removeItem('is2faVerified');
        }
    }

    function updateUserProfile(newData) {
        setCurrentUser(prev => {
            if (!prev) return null;
            return { ...prev, ...newData, isNewUser: false };
        });
    }

    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    function googleSignIn() {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    }

    function sendMagicLink(email) {
        const actionCodeSettings = {
            url: window.location.origin + '/email-verify',
            handleCodeInApp: true,
        };
        return sendSignInLinkToEmail(auth, email, actionCodeSettings);
    }

    function signInWithMagicLink(email, href) {
        return signInWithEmailLink(auth, email, href);
    }

    function isMagicLink(href) {
        return isSignInWithEmailLink(auth, href);
    }

    function mockLogin() {
        return signInAnonymously(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Fetch user details from MongoDB (Role, Institution, etc.)
                    const token = await user.getIdToken();

                    // Add timeout to prevent hanging if backend is down
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

                    const res = await fetch(`${API_BASE_URL}/auth/profile?uid=${user.uid}`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (res.ok) {
                        const dbUser = await res.json();

                        // Handle case where user doesn't exist in DB yet (fresh db)
                        if (dbUser.exists === false) {
                            // Default to student role so they can access the dashboard and eventually register properly
                            setCurrentUser({ ...user, role: 'student', isNewUser: true });
                        } else {
                            // Merge Firebase User with MongoDB User Data
                            // IMPORTANT: We must manually wrap getIdToken because spreading ...user removes prototype methods
                            setCurrentUser({
                                ...user,
                                ...dbUser,
                                getIdToken: (force) => user.getIdToken(force)
                            });
                        }
                    } else {
                        // Fallback if DB user doesn't exist yet (e.g. partial signup)
                        setCurrentUser({ ...user, role: 'student' });
                    }
                } catch (err) {
                    console.error("Failed to fetch user profile", err);
                    // Use basic user info if backend fails, BUT ensure role is set to 'student' so they aren't kicked out
                    setCurrentUser({ ...user, role: 'student', isOffline: true });
                }
            } else {
                setCurrentUser(null);
                // If logged out, clear 2FA state
                setIs2faVerified(false);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        updateUserProfile,
        signup,
        login,
        logout,
        resetPassword,
        googleSignIn,
        sendMagicLink,
        signInWithMagicLink,
        isMagicLink,
        mockLogin,
        is2faVerified,
        setIs2faVerified
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <Spinner /> : children}
        </AuthContext.Provider>
    );
}

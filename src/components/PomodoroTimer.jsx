import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FaPlay, FaPause, FaRedo, FaCoffee, FaBrain } from 'react-icons/fa';
import { API_BASE_URL } from '../config/api';
import './PomodoroTimer.css'; // We'll create this CSS next

const PomodoroTimer = () => {
    const { currentUser } = useAuth();
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('work'); // 'work' or 'break'
    const intervalRef = useRef(null);

    const WORK_TIME = 25;
    const BREAK_TIME = 5;

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                if (seconds === 0) {
                    if (minutes === 0) {
                        clearInterval(intervalRef.current);
                        setIsActive(false);
                        handleTimerComplete();
                    } else {
                        setMinutes(minutes - 1);
                        setSeconds(59);
                    }
                } else {
                    setSeconds(seconds - 1);
                }
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isActive, minutes, seconds]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setMinutes(mode === 'work' ? WORK_TIME : BREAK_TIME);
        setSeconds(0);
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setIsActive(false);
        setMinutes(newMode === 'work' ? WORK_TIME : BREAK_TIME);
        setSeconds(0);
    };

    const handleTimerComplete = async () => {
        // Play sound (optional)
        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        audio.play().catch(e => console.log("Audio play failed", e));

        if (mode === 'work') {
            try {
                // Log the session
                await axios.post(`${API_BASE_URL}/gamification/log-session`, {
                    uid: currentUser.uid,
                    durationMinutes: WORK_TIME,
                    type: 'work'
                });
                alert("Great focus session! Take a break.");
                switchMode('break');
            } catch (error) {
                console.error("Failed to log session:", error);
            }
        } else {
            alert("Break over! Ready to focus?");
            switchMode('work');
        }
    };

    const progress = 100 - (((minutes * 60 + seconds) / ((mode === 'work' ? WORK_TIME : BREAK_TIME) * 60)) * 100);

    return (
        <div className="pomodoro-container">
            <div className="pomodoro-header">
                <h3><FaBrain /> Focus Timer</h3>
                <div className="mode-toggles">
                    <button
                        className={`mode-btn ${mode === 'work' ? 'active' : ''}`}
                        onClick={() => switchMode('work')}
                    >
                        Work
                    </button>
                    <button
                        className={`mode-btn ${mode === 'break' ? 'active' : ''}`}
                        onClick={() => switchMode('break')}
                    >
                        Break
                    </button>
                </div>
            </div>

            <div className="timer-display">
                <div className="circular-progress" style={{ background: `conic-gradient(var(--primary-color) ${progress}%, #333 ${progress}%)` }}>
                    <div className="inner-circle">
                        <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                        <p>{mode === 'work' ? 'Focusing...' : 'Resting...'}</p>
                    </div>
                </div>
            </div>

            <div className="timer-controls">
                <button className="control-btn main" onClick={toggleTimer}>
                    {isActive ? <FaPause /> : <FaPlay />}
                </button>
                <button className="control-btn secondary" onClick={resetTimer}>
                    <FaRedo />
                </button>
            </div>
        </div>
    );
};

export default PomodoroTimer;

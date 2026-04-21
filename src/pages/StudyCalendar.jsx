import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import AILayout from '../components/Layout/AILayout';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

const localizer = momentLocalizer(moment);

const StudyCalendar = () => {
    const { currentUser } = useAuth();
    const [events, setEvents] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [examForm, setExamForm] = useState({ subject: '', date: '', syllabus: '' });

    const fetchSchedule = async () => {
        if (!currentUser) return;
        try {
            // Fetch TimeTable from Backend
            const response = await fetch(`${API_BASE_URL}/study/timetable?userId=${currentUser.uid}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.schedule) {
                    const today = new Date();
                    const currentDayIndex = today.getDay(); // 0 = Sunday
                    const daysMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };

                    // Convert weekly schedule to actual dates for this week
                    const events = data.schedule.map((slot, index) => {
                        const slotDayIndex = daysMap[slot.day];

                        // Calculate date for this slot in current week
                        // diff = slotDay - currentDay
                        let diff = slotDayIndex - currentDayIndex;

                        const slotDate = new Date();
                        slotDate.setDate(today.getDate() + diff);

                        const [startH, startM] = slot.startTime.split(':').map(Number);
                        const [endH, endM] = slot.endTime.split(':').map(Number);

                        const start = new Date(slotDate);
                        start.setHours(startH, startM, 0);

                        const end = new Date(slotDate);
                        end.setHours(endH, endM, 0);

                        return {
                            id: index,
                            title: slot.subject,
                            start,
                            end,
                            resource: slot.subject.includes('Exam') || slot.subject.includes('Revision') ? 'Exam' : 'Study',
                            allDay: false
                        };
                    });
                    setEvents(events);
                }
            }
        } catch (error) {
            console.error("Failed to fetch schedule:", error);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, [currentUser]);

    const handleAddExam = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/study/exams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: currentUser.uid,
                    subject: examForm.subject,
                    date: examForm.date,
                    syllabus: examForm.syllabus
                })
            });

            if (response.ok) {
                setShowModal(false);
                setExamForm({ subject: '', date: '', syllabus: '' });
                alert("Exam added! The AI is optimizing your schedule...");
                // Wait for automation to run then refresh
                setTimeout(fetchSchedule, 4000);
            } else {
                alert("Failed to add exam.");
            }
        } catch (error) {
            console.error(error);
            alert("Error adding exam.");
        }
    };

    const eventStyleGetter = (event) => {
        let backgroundColor = '#38BDF8';
        if (event.resource === 'Exam') backgroundColor = '#F43F5E';
        if (event.resource === 'Focus') backgroundColor = '#10B981';

        return {
            style: {
                backgroundColor,
                borderRadius: '8px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    return (
        <AILayout>
            <div className="flex-1 p-6 md:p-10 h-full flex flex-col relative">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex justify-between items-center"
                >
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Study Calendar
                    </h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:scale-105 transition-transform"
                    >
                        + Add Exam
                    </button>
                </motion.div>

                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700"
                        >
                            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Add Upcoming Exam</h2>
                            <form onSubmit={handleAddExam} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white"
                                        placeholder="e.g. Physics"
                                        value={examForm.subject}
                                        onChange={e => setExamForm({ ...examForm, subject: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white"
                                        value={examForm.date}
                                        onChange={e => setExamForm({ ...examForm, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Topics / Syllabus</label>
                                    <textarea
                                        className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white"
                                        placeholder="Specific chapters..."
                                        rows="3"
                                        value={examForm.syllabus}
                                        onChange={e => setExamForm({ ...examForm, syllabus: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium shadow-lg shadow-primary-500/20"
                                    >
                                        Save & Schedule
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-800"
                >
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 'calc(100vh - 200px)' }}
                        eventPropGetter={eventStyleGetter}
                        views={['month', 'week', 'day', 'agenda']}
                        defaultView="month"
                        className="dark:text-slate-200"
                    />
                </motion.div>
            </div>

            <style jsx global>{`
                /* Dark Mode Overrides for Calendar */
                .rbc-calendar {
                    font-family: 'Outfit', sans-serif;
                }
                .dark .rbc-off-range-bg {
                    background: #1e293b;
                }
                .dark .rbc-today {
                    background: rgba(56, 189, 248, 0.1);
                }
                .dark .rbc-toolbar button {
                    color: white;
                    border-color: #334155;
                }
                .dark .rbc-toolbar button:hover {
                    background: #334155;
                }
                .dark .rbc-toolbar button.rbc-active {
                    background: #38BDF8;
                    color: white;
                }
                .dark .rbc-header {
                    border-bottom-color: #334155;
                }
                .dark .rbc-month-view, .dark .rbc-time-view, .dark .rbc-agenda-view {
                    border-color: #334155;
                }
                .dark .rbc-day-bg + .rbc-day-bg {
                    border-left-color: #334155;
                }
                .dark .rbc-month-row + .rbc-month-row {
                    border-top-color: #334155;
                }
            `}</style>
        </AILayout>
    );
};

export default StudyCalendar;

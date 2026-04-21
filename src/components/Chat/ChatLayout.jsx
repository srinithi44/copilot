import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Menu, Plus, MessageSquare, Settings } from 'lucide-react';
import Button from '../Button';

export default function ChatLayout({ children, sidebar }) {
    const { logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside
                className="sidebar"
                style={{ width: isSidebarOpen ? '260px' : '0px' }}
            >
                <div className="sidebar-header">
                    <div className="logo-container">
                        <MessageSquare size={20} color="white" />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '1.25rem', letterSpacing: '-0.025em' }}>Copilot</span>
                </div>

                <div style={{ padding: '0 1rem 1.5rem' }}>
                    <button className="nav-item" style={{
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontWeight: '600'
                    }}>
                        <Plus size={18} /> New Chat
                    </button>
                </div>

                <div className="sidebar-nav">
                    <div className="nav-section-title">Recent Activity</div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="nav-item">
                            <MessageSquare size={16} />
                            <span>Previous Session {i}</span>
                        </div>
                    ))}
                </div>

                <div className="sidebar-footer">
                    <button onClick={logout} className="nav-item" style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8'
                    }}>
                        <LogOut size={18} /> Sign out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            style={{
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-secondary)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Menu size={20} />
                        </button>
                        <h1 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>AI Assistant</h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.375rem 0.75rem', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '600' }}>
                            v1.0 Pro
                        </div>
                        <button className="nav-item" style={{ padding: '0.5rem', minWidth: 'auto', backgroundColor: 'transparent' }}>
                            <Settings size={20} />
                        </button>
                    </div>
                </header>

                <div className="content-scroll">
                    {children}
                </div>
            </main>
        </div>
    );
}

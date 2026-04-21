import React from 'react';
import { motion } from 'framer-motion';
import { 
    BookOpen, 
    Headphones, 
    GitBranch, 
    Calendar, 
    ArrowRight, 
    CheckCircle2, 
    MessageSquare, 
    ChevronRight,
    Github,
    Linkedin,
    Mail,
    Send,
    Sparkles,
    Bell,
    Flame,
    TrendingUp,
    MoreHorizontal,
    Clock,
    Layers
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    const features = [
        {
            icon: <BookOpen className="w-6 h-6 text-primary" />,
            title: "Exam Answer Generator",
            description: "Upload your notes or PPTs and get detailed, exam-focused answers instantly."
        },
        {
            icon: <Headphones className="w-6 h-6 text-secondary" />,
            title: "Podcast Learning",
            description: "Convert your study material into engaging AI-generated podcasts for on-the-go learning."
        },
        {
            icon: <GitBranch className="w-6 h-6 text-primary" />,
            title: "Flowchart Generator",
            description: "Visualize complex concepts with automatically generated, easy-to-understand flowcharts."
        },
        {
            icon: <Calendar className="w-6 h-6 text-secondary" />,
            title: "Smart Revision Planner",
            description: "AI-powered scheduling that adapts to your learning pace and exam dates."
        }
    ];

    const steps = [
        { title: "Upload PPT/PDF", description: "Drag and drop your study materials into the platform." },
        { title: "AI analyzes content", description: "Our advanced models extract key concepts and data." },
        { title: "Generate Resources", description: "Get answers, podcasts, and flowcharts in seconds." },
        { title: "Start Learning", description: "Master your subjects with high-quality AI assistance." }
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-primary/20">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 glass">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow-lg">
                            <BookOpen size={24} />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900">StudyPlan<span className="text-secondary">Copilot</span></span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Features</a>
                        <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">How It Works</a>
                        <a href="#contact" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Contact</a>
                        <button 
                            onClick={() => navigate(currentUser ? '/dashboard' : '/login')}
                            className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-lg"
                        >
                            {currentUser ? 'Dashboard' : 'Get Started'}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-secondary text-xs font-bold mb-8">
                            <Sparkles size={14} className="animate-pulse" /> NEW: AI PODCAST GENERATOR
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] mb-8 tracking-tight text-slate-900">
                            Turn Your Notes into <br className="hidden sm:block" />
                            <span className="gradient-text">Exam Success</span> with AI
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto font-medium">
                            Upload PPTs and get detailed answers, immersive learning podcasts, and concept flowcharts instantly. 
                        </p>
                        <div className="flex flex-wrap justify-center gap-5">
                             <button 
                                onClick={() => navigate(currentUser ? '/dashboard' : '/signup')}
                                className="px-12 py-4 rounded-full gradient-bg text-white font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-primary/30"
                            >
                                {currentUser ? 'Go to Dashboard' : 'Get Started'} <ArrowRight size={20} />
                            </button>
                            <a href="#chat-demo" className="px-12 py-4 rounded-full border-2 border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                                Try Demo
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-6 relative bg-white">
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <motion.h2 {...fadeInUp} className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">Powerful Features for <span className="gradient-text">Top Grades</span></motion.h2>
                    <motion.p {...fadeInUp} className="text-slate-500 max-w-2xl mx-auto font-medium text-lg">Everything you need to master your syllabus in record time using advanced artificial intelligence.</motion.p>
                </div>

                <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-section flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed font-medium">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 px-6 bg-section">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.h2 {...fadeInUp} className="text-4xl font-bold mb-4 text-slate-900">How It Works</motion.h2>
                        <p className="text-slate-500 font-medium text-lg">Transform your study habits in four simple steps.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 relative">
                        {steps.map((step, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative text-center group"
                            >
                                <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-white text-2xl font-black mx-auto mb-6 relative z-10 border-4 border-white shadow-lg group-hover:scale-110 transition-transform">
                                    {idx + 1}
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-[3px] bg-sky-100 -z-0" />
                                )}
                                <h3 className="text-lg font-bold mb-2 text-slate-900">{step.title}</h3>
                                <p className="text-slate-500 text-sm px-4 font-medium leading-relaxed">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Chat Demo Section */}
            <section id="chat-demo" className="py-32 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <motion.div {...fadeInUp}>
                        <h2 className="text-4xl font-extrabold mb-6 text-slate-900 tracking-tight">Interactive <span className="text-secondary">Chat Demo</span></h2>
                        <p className="text-slate-500 mb-10 text-lg font-medium leading-relaxed">
                            Experience the power of our AI assistant. Ask questions about your study material and get instant, accurate responses with citations.
                        </p>
                        <div className="space-y-4">
                            {[
                                "Summarize the key points of Chapter 4",
                                "Explain the 'Second Law of Thermodynamics' simply",
                                "Create a study schedule for my Calculus exam"
                            ].map((q, i) => (
                                <div key={i} className="flex items-center gap-4 p-5 rounded-[20px] bg-slate-50 border border-slate-200 cursor-pointer hover:border-primary hover:bg-white hover:shadow-lg transition-all">
                                    <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-secondary">
                                        <MessageSquare size={18} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{q}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="bg-white rounded-[40px] p-8 shadow-[0_20px_50px_rgba(56,189,248,0.15)] border border-slate-100">
                            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center text-white shadow-lg">
                                        <Sparkles size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text- slate-900 leading-none mb-1 text-lg">StudyPlan AI</p>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active Now</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-secondary transition-colors"><Headphones size={20} /></div>
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-secondary transition-colors"><GitBranch size={20} /></div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex gap-3">
                                    <div className="bg-slate-50 p-5 rounded-[24px] rounded-tl-none text-sm max-w-[85%] leading-relaxed text-slate-700 font-medium">
                                        I've analyzed your "Neural Networks" PPT. Would you like a 5-minute podcast summary or a flowchart of the architecture?
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <div className="gradient-bg p-5 rounded-[24px] rounded-tr-none text-sm max-w-[85%] text-white font-bold shadow-xl shadow-primary/20">
                                        Podcasts sound great! Also, generate mock questions for the final exam.
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="bg-slate-50 p-5 rounded-[24px] rounded-tl-none text-sm max-w-[85%] leading-relaxed text-slate-700 font-medium">
                                        Coming right up! I'm creating a 2-speaker podcast and 15 mock questions based on past papers.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -z-10 -bottom-10 -right-10 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
                    </motion.div>
                </div>
            </section>

            {/* Dashboard Preview Section */}
            <section className="py-24 px-6 bg-section">
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <motion.h2 {...fadeInUp} className="text-4xl font-bold mb-4 text-slate-900 tracking-tight">Centralized <span className="text-secondary">Learning Dashboard</span></motion.h2>
                    <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg">Track your progress and access all your AI tools from one beautiful interface.</p>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-6xl mx-auto bg-white rounded-[32px] md:rounded-[48px] p-2 md:p-8 shadow-[0_40px_80px_rgba(15,23,42,0.08)] overflow-hidden border border-slate-100"
                >
                    <div className="bg-slate-50 rounded-[24px] md:rounded-[40px] overflow-hidden flex flex-col h-auto min-h-[500px] md:h-[700px] border border-slate-100 relative group/preview">
                        {/* Top Nav Mockup */}
                        <div className="h-16 sm:h-20 w-full border-b border-slate-200 flex items-center justify-between px-4 sm:px-10 bg-white shrink-0 relative z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-bg shadow-lg shadow-primary/20 flex items-center justify-center text-white">
                                    <BookOpen size={18} />
                                </div>
                                <div className="hidden xs:block">
                                    <p className="text-xs sm:text-sm font-black text-slate-900 tracking-tighter">StudyPlanCopilot</p>
                                    <p className="text-[8px] sm:text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Healthy Status</p>
                                </div>
                            </div>
                            <div className="hidden md:flex gap-8">
                                {['Learning Hub', 'My Vault', 'Flashcards', 'Community'].map((item, i) => (
                                    <div key={i} className={`text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-primary transition-colors ${i === 0 ? 'text-primary' : 'text-slate-400'}`}>
                                        {item}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400"><Bell size={18} /></div>
                                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm">JS</div>
                            </div>
                        </div>

                        {/* Main Content Mockup */}
                        <div className="flex-1 p-4 sm:p-10 overflow-hidden relative z-10">
                            {/* Greeting Overlay */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="space-y-1">
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Good Morning, James 👋</h3>
                                    <p className="text-xs sm:text-sm text-slate-400 font-medium italic">"You're 12% closer to your Psychology goal than yesterday."</p>
                                </div>
                                <div className="flex gap-2 sm:gap-4">
                                    <div className="px-4 sm:px-6 py-2 sm:py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2 sm:gap-3">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center"><Flame size={14} /></div>
                                        <span className="text-[10px] sm:text-sm font-black text-slate-900">12 Day Streak</span>
                                    </div>
                                    <div className="px-4 sm:px-6 py-2 sm:py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2 sm:gap-3">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><TrendingUp size={14} /></div>
                                        <span className="text-[10px] sm:text-sm font-black text-slate-900">Top 5% Rank</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 h-full">
                                {/* Left: Active Study Plan */}
                                <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
                                    <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group-hover/preview:scale-[1.01] transition-transform">
                                        <div className="flex justify-between items-start mb-8 relative z-10">
                                            <div>
                                                <span className="text-[10px] font-black text-primary px-2 py-1 bg-primary/5 rounded-lg border border-primary/10 tracking-widest uppercase">COMPUTER SCIENCE</span>
                                                <h4 className="text-xl font-black text-slate-900 mt-3">Full-Stack Development Mastery</h4>
                                            </div>
                                            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl"><MoreHorizontal size={20} /></button>
                                        </div>
                                        
                                        <div className="space-y-4 mb-4 relative z-10">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <span>Course Progress</span>
                                                <span className="text-primary">68%</span>
                                            </div>
                                            <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                                <div className="h-full bg-primary rounded-full shadow-lg shadow-primary/20" style={{ width: '68%' }} />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 relative z-10">
                                            <p className="text-xs font-bold text-slate-400 italic">Next: "React Advanced Patterns"</p>
                                            <button className="px-8 py-3 bg-primary text-white rounded-2xl text-xs font-black shadow-lg shadow-primary/20">Resume Learning</button>
                                        </div>
                                        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/5 blur-3xl rounded-full" />
                                    </div>

                                    {/* Sub Grid for other info */}
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 border border-indigo-100 flex items-center justify-center font-bold">
                                                <CheckCircle2 size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">TASKS DONE</p>
                                                <p className="text-2xl font-black text-slate-900">24/30</p>
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center font-bold">
                                                <Clock size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">HOURS STUDIED</p>
                                                <p className="text-2xl font-black text-slate-900">12.5h</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: AI Assistant Widget */}
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
                                    <div className="bg-gradient-to-br from-slate-900 to-indigo-900 text-white rounded-[32px] p-8 h-full shadow-xl shadow-indigo-200 relative overflow-hidden flex flex-col">
                                        <div className="relative z-10 flex items-center gap-3 mb-8">
                                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                                <Sparkles size={20} className="text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold tracking-tight">AI Assistant</h4>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                    <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Active Insight</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative z-10 flex-1 space-y-6">
                                            <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl rounded-tl-none border border-white/10">
                                                <p className="text-xs font-medium leading-relaxed italic">"James, based on your last quiz, I've prepared a special recap on 'B-Trees' for you. Ready?"</p>
                                            </div>
                                            <div className="space-y-3">
                                                {['Show recap', 'Take quick quiz', 'Remind me later'].map((opt, i) => (
                                                    <div key={i} className="px-5 py-3 rounded-xl border border-white/20 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/70 hover:bg-white hover:text-indigo-900 transition-all cursor-pointer">
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="relative z-10 mt-auto pt-6 border-t border-white/10">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-10 bg-white/10 rounded-xl px-4 flex items-center text-[10px] text-white/40">Ask AI anything...</div>
                                                <button className="w-10 h-10 bg-white text-indigo-900 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-white/10"><Send size={18} /></button>
                                            </div>
                                        </div>
                                        
                                        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 blur-3xl rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Background Floating Decorative Icons */}
                        <div className="absolute top-1/4 left-1/4 -z-0 text-slate-100 opacity-20 pointer-events-none transform -rotate-12 group-hover/preview:rotate-0 transition-transform duration-1000"><Layers size={120} /></div>
                        <div className="absolute bottom-1/4 right-1/4 -z-0 text-slate-100 opacity-20 pointer-events-none transform rotate-12 group-hover/preview:rotate-0 transition-transform duration-1000"><Sparkles size={140} /></div>
                    </div>
                </motion.div>
            </section>

            {/* Benefits Section */}
            <section className="py-32 px-6 bg-white">
                <div className="max-w-7xl mx-auto text-center mb-20">
                    <h2 className="text-4xl font-extrabold mb-4 text-slate-900 tracking-tight">Why Students Choice <span className="gradient-text">StudyPlanCopilot</span></h2>
                </div>
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { label: "Faster Revision", value: "3x", desc: "Save hours of manual note-taking and summarizing." },
                        { label: "Exam-Focused", value: "95%", desc: "Focus on concepts that actually appear in exams." },
                        { label: "Versatile Learning", value: "60%", desc: "Switch between reading, watching, and listening." },
                        { label: "Student Success", value: "10k+", desc: "Helping students worldwide achieve their dream grades." }
                    ].map((stat, i) => (
                        <motion.div 
                            key={i} 
                            whileHover={{ y: -10 }}
                            className="text-center p-10 rounded-[32px] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all"
                        >
                            <h4 className="text-5xl font-black gradient-text mb-6">{stat.value}</h4>
                            <h5 className="text-xl font-bold mb-3 text-slate-900">{stat.label}</h5>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">{stat.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-24 px-6 bg-section">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-[48px] p-8 md:p-16 border border-slate-100 shadow-[0_30px_60px_rgba(15,23,42,0.05)]">
                        <div className="grid lg:grid-cols-2 gap-20">
                            <div>
                                <h2 className="text-4xl font-extrabold mb-6 text-slate-900 tracking-tight">Get in <span className="text-secondary">Touch</span></h2>
                                <p className="text-slate-600 mb-12 text-lg font-medium leading-relaxed">
                                    Have questions about how StudyPlanCopilot can help you? Our team is here to support your learning journey every step of the way.
                                </p>
                                <div className="space-y-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-secondary shadow-inner">
                                            <Mail size={28} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-2">Email address</p>
                                            <p className="font-bold text-slate-900 text-lg">hello@studyplancopilot.ai</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-secondary shadow-inner">
                                            <Send size={28} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-2">Follow updates</p>
                                            <p className="font-bold text-slate-900 text-lg">@StudyPlanCopilot</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <form className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <input 
                                        type="text" 
                                        placeholder="Full Name" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 outline-none focus:border-secondary transition-all placeholder:text-slate-400 font-medium"
                                    />
                                    <input 
                                        type="email" 
                                        placeholder="Email Address" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 outline-none focus:border-secondary transition-all placeholder:text-slate-400 font-medium"
                                    />
                                </div>
                                <textarea 
                                    rows="5" 
                                    placeholder="How can we help you?" 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 outline-none focus:border-secondary transition-all placeholder:text-slate-400 font-medium resize-none"
                                ></textarea>
                                <button className="w-full py-5 rounded-2xl gradient-bg text-white font-black text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-3">
                                    Send Message <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white pt-24 pb-12 px-6 border-t border-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20 text-center md:text-left">
                        <div className="col-span-1 lg:col-span-1">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-8">
                                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                    <BookOpen size={24} />
                                </div>
                                <span className="font-black text-2xl tracking-tighter text-slate-900">StudyPlan<span className="text-secondary">Copilot</span></span>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed mb-10 font-medium">
                                We are on a mission to make high-quality education accessible and engaging through the power of artificial intelligence.
                            </p>
                            <div className="flex justify-center md:justify-start gap-4">
                                <a href="#" className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-secondary hover:shadow-lg transition-all">
                                    <Github size={22} />
                                </a>
                                <a href="#" className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-secondary hover:shadow-lg transition-all">
                                    <Linkedin size={22} />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-black text-slate-900 mb-8 uppercase tracking-widest text-xs">Product</h4>
                            <ul className="space-y-5 text-sm font-bold text-slate-500">
                                <li><a href="#features" className="hover:text-secondary transition-colors">Features</a></li>
                                <li><button onClick={() => navigate('/pricing')} className="hover:text-secondary transition-colors text-left uppercase text-[10px] tracking-widest">Premium Plans</button></li>
                                <li><a href="#" className="hover:text-secondary transition-colors">AI Resources</a></li>
                                <li><a href="#" className="hover:text-secondary transition-colors">Case Studies</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-black text-slate-900 mb-8 uppercase tracking-widest text-xs">Support</h4>
                            <ul className="space-y-5 text-sm font-bold text-slate-500">
                                <li><a href="#how-it-works" className="hover:text-secondary transition-colors">How It Works</a></li>
                                <li><a href="#" className="hover:text-secondary transition-colors">Help Center</a></li>
                                <li><a href="#contact" className="hover:text-secondary transition-colors">Contact Support</a></li>
                                <li><a href="#" className="hover:text-secondary transition-colors">Discord Community</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-black text-slate-900 mb-8 uppercase tracking-widest text-xs">Newsletter</h4>
                            <p className="text-sm text-slate-500 mb-8 font-medium">Get the latest updates on AI-driven education.</p>
                            <div className="relative group">
                                <input 
                                    type="email" 
                                    placeholder="you@email.com" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm text-slate-900 focus:border-secondary outline-none transition-all font-medium" 
                                />
                                <button className="absolute right-2 top-2 bottom-2 px-5 rounded-xl gradient-bg text-white shadow-lg">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">
                        <p>© 2026 StudyPlanCopilot. All rights reserved.</p>
                        <div className="flex gap-12 items-center">
                            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> API: Operational</span>
                            <span>Privacy Policy</span>
                            <span>Terms</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

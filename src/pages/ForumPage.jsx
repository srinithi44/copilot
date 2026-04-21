import React, { useState, useEffect } from 'react';
import AILayout from '../components/Layout/AILayout';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { MessageSquare, Heart, Share2, Send, Plus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

const ForumPage = () => {
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState([]);
    const [filter, setFilter] = useState('All');
    const [isCreating, setIsCreating] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });
    const [loading, setLoading] = useState(true);

    const categories = ['All', 'General', 'Doubts', 'Projects', 'Resources', 'Exam Prep'];

    useEffect(() => {
        fetchPosts();
    }, [filter]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const query = filter !== 'All' ? `?category=${filter}` : '';
            const res = await axios.get(`${API_BASE_URL}/forum${query}`);
            setPosts(res.data);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPost.title || !newPost.content) return;

        try {
            const res = await axios.post(`${API_BASE_URL}/forum`, {
                uid: currentUser.uid,
                ...newPost
            });
            setPosts([res.data, ...posts]);
            setIsCreating(false);
            setNewPost({ title: '', content: '', category: 'General' });
        } catch (error) {
            console.error("Failed to create post", error);
        }
    };

    const handleLike = async (postId) => {
        try {
            const res = await axios.put(`${API_BASE_URL}/forum/${postId}/like`, {
                uid: currentUser.uid
            });

            // Update local state
            setPosts(posts.map(post => {
                if (post._id === postId) {
                    return { ...post, likes: res.data.likes }; // res.data.likes is the new array
                }
                return post;
            }));
        } catch (error) {
            console.error("Failed to like post", error);
        }
    };

    return (
        <AILayout>
            <div className="max-w-4xl mx-auto p-6 w-full">

                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white font-outfit">Community Forum</h1>
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2"
                    >
                        {isCreating ? 'Cancel' : <><Plus size={18} /> Create Post</>}
                    </button>
                </div>

                {/* Create Post Form */}
                <AnimatePresence>
                    {isCreating && (
                        <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleCreatePost}
                            className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 mb-8 overflow-hidden"
                        >
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Title"
                                    className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-lg outline-none focus:ring-2 ring-orange-400 dark:text-white"
                                    value={newPost.title}
                                    onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                />
                                <textarea
                                    placeholder="What's on your mind?"
                                    className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-lg outline-none focus:ring-2 ring-orange-400 min-h-[100px] dark:text-white"
                                    value={newPost.content}
                                    onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                                />
                                <div className="flex justify-between items-center">
                                    <select
                                        className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg outline-none dark:text-white"
                                        value={newPost.category}
                                        onChange={e => setNewPost({ ...newPost, category: e.target.value })}
                                    >
                                        {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium">Post</button>
                                </div>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === cat ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Posts List */}
                <div className="space-y-6">
                    {loading ? (
                        <p className="text-center text-slate-500">Loading details...</p>
                    ) : (
                        posts.map(post => (
                            <motion.div
                                key={post._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold">
                                            {post.userName[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800 dark:text-white">{post.title}</h3>
                                            <p className="text-xs text-slate-500">{post.userName} • {new Date(post.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-xs rounded-full text-slate-600 dark:text-slate-400">
                                        {post.category}
                                    </span>
                                </div>

                                <p className="text-slate-600 dark:text-slate-300 mb-4 whitespace-pre-wrap">{post.content}</p>

                                <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400 text-sm">
                                    <button
                                        onClick={() => handleLike(post._id)}
                                        className={`flex items-center gap-2 hover:text-red-500 transition-colors ${post.likes.includes(currentUser.uid) ? 'text-red-500' : ''}`}
                                    >
                                        <Heart size={18} className={post.likes.includes(currentUser.uid) ? 'fill-current' : ''} />
                                        {post.likes.length}
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                                        <MessageSquare size={18} />
                                        {post.comments?.length || 0}
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-green-500 transition-colors ml-auto">
                                        <Share2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </AILayout>
    );
};

export default ForumPage;

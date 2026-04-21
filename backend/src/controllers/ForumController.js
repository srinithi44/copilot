import ForumPost from '../models/ForumPost.js';
import User from '../models/User.js';

// Get all posts (with filtering and sorting)
export const getPosts = async (req, res) => {
    try {
        const { category, sort = 'newest' } = req.query;
        let query = {};
        if (category && category !== 'All') query.category = category;

        let sortOption = { createdAt: -1 };
        if (sort === 'popular') sortOption = { 'likes.length': -1, views: -1 };

        const posts = await ForumPost.find(query).sort(sortOption).limit(50);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch posts" });
    }
};

// Create a new post
export const createPost = async (req, res) => {
    try {
        const { uid, title, content, category } = req.body;
        if (!uid || !title || !content) return res.status(400).json({ error: "Missing fields" });

        const user = await User.findOne({ uid });
        const userName = user?.name || 'Student'; // Fallback

        const newPost = new ForumPost({
            userId: uid,
            userName,
            title,
            content,
            category: category || 'General'
        });

        await newPost.save();
        res.json(newPost);
    } catch (error) {
        res.status(500).json({ error: "Failed to create post" });
    }
};

// Like a post
export const likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { uid } = req.body;

        const post = await ForumPost.findById(id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const index = post.likes.indexOf(uid);
        if (index === -1) {
            post.likes.push(uid);
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();
        res.json({ likes: post.likes });
    } catch (error) {
        res.status(500).json({ error: "Failed to like post" });
    }
};

// Add a comment
export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { uid, content } = req.body;

        const user = await User.findOne({ uid });
        const userName = user?.name || 'Student';

        const post = await ForumPost.findById(id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        post.comments.push({
            userId: uid,
            userName,
            content
        });

        await post.save();
        res.json(post.comments);
    } catch (error) {
        res.status(500).json({ error: "Failed to add comment" });
    }
};

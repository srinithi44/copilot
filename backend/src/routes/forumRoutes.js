import express from 'express';
import { getPosts, createPost, likePost, addComment } from '../controllers/ForumController.js';

const router = express.Router();

router.get('/', getPosts);
router.post('/', createPost);
router.put('/:id/like', likePost);
router.post('/:id/comment', addComment);

export default router;

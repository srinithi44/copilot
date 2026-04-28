import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const uploadSyllabus = async (file, userId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    try {
        const response = await api.post('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        const data = error.response?.data;
        const details = data?.details;
        const msg = details || data?.error || data?.message || (typeof data === 'string' ? data : error.message);
        throw new Error(msg || 'Upload failed');
    }
};

export const getDocuments = async (userId) => {
    try {
        const response = await api.get('/documents', { params: { userId } });
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.error || error.response?.data?.details || (typeof error.response?.data === 'string' ? error.response.data : error.message);
        throw new Error(msg || 'Failed to fetch documents');
    }
};

export const chatWithAI = async (query, userId, language = 'English') => {
    try {
        const response = await api.post('/ai/chat', { query, userId, language });
        return response.data.response;
    } catch (error) {
        const msg = error.response?.data?.error || error.response?.data?.details || (typeof error.response?.data === 'string' ? error.response.data : error.message);
        throw new Error(msg || 'Chat failed');
    }
};

export const generateStudyPlan = async (data) => {
    try {
        const response = await api.post('/ai/plan', data);
        return response.data.plan;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const generateMockTest = async (data) => {
    try {
        const response = await api.post('/ai/test', data);
        return response.data.test;
    } catch (error) {
        const msg = error.response?.data?.error || error.response?.data?.details || (typeof error.response?.data === 'string' ? error.response.data : error.message);
        throw new Error(msg || 'Failed to generate test');
    }
};

export const submitMockTestAttempt = async (data) => {
    try {
        const response = await api.post('/ai/test/submit', data);
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.error || error.response?.data?.details || (typeof error.response?.data === 'string' ? error.response.data : error.message);
        throw new Error(msg || 'Failed to submit test attempt');
    }
};

export const getWeeklyMockTestProgress = async (userId) => {
    try {
        const response = await api.get('/ai/test/weekly-progress', { params: { userId } });
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.error || error.response?.data?.details || (typeof error.response?.data === 'string' ? error.response.data : error.message);
        throw new Error(msg || 'Failed to fetch weekly mock test progress');
    }
};

// ── File Upload for AI Chat ─────────────────────────────────────────────────

export const uploadFileForChat = async (file, userId, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    try {
        const response = await api.post('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: onProgress
                ? (e) => onProgress(Math.round((e.loaded * 100) / e.total))
                : undefined,
        });
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.error || error.response?.data?.details || error.message;
        throw new Error(msg || 'File upload failed');
    }
};

export const chatWithFile = async (query, userId, language, fileContent, fileName) => {
    try {
        const response = await api.post('/files/chat', {
            query, userId, language, fileContent, fileName
        });
        return response.data.response;
    } catch (error) {
        const msg = error.response?.data?.error || error.response?.data?.details || error.message;
        throw new Error(msg || 'Chat failed');
    }
};

// ── Podcast Episodes ────────────────────────────────────────────────────────

export const uploadPodcastEpisode = async (audioFile, coverFile, metadata, onProgress) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    if (coverFile) formData.append('cover', coverFile);
    formData.append('title', metadata.title || audioFile.name);
    formData.append('description', metadata.description || '');
    formData.append('userId', metadata.userId || 'dev_user');
    if (metadata.duration) formData.append('duration', metadata.duration);

    try {
        const response = await api.post('/podcast/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: onProgress
                ? (e) => onProgress(Math.round((e.loaded * 100) / e.total))
                : undefined,
        });
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.error || error.response?.data?.details || error.message;
        throw new Error(msg || 'Podcast upload failed');
    }
};

export const getPodcastEpisodes = async (userId) => {
    try {
        const response = await api.get('/podcast/episodes', { params: { userId } });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to fetch episodes');
    }
};

export const deletePodcastEpisode = async (episodeId) => {
    try {
        await api.delete(`/podcast/episodes/${episodeId}`);
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to delete episode');
    }
};

export default api;


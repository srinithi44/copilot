import mongoose from 'mongoose';

const podcastEpisodeSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    audioFilename: { type: String, required: true },
    audioPath: { type: String, required: true },
    coverImagePath: { type: String, default: '' },
    duration: { type: Number, default: 0 },         // seconds
    format: { type: String, default: 'mp3' },
    fileSize: { type: Number, default: 0 },          // bytes
    createdAt: { type: Date, default: Date.now }
});

const PodcastEpisode = mongoose.model('PodcastEpisode', podcastEpisodeSchema);
export default PodcastEpisode;

import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    docId: { type: String, required: true, unique: true },
    filename: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now }
});

const Document = mongoose.model('Document', documentSchema);

export default Document;

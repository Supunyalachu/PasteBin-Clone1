import mongoose from 'mongoose';

const pasteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  maxViews: {
    type: Number,
    default: null
  },
  views: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model('Paste', pasteSchema);

import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: String, default: '' },
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1 });

export default mongoose.model('Chat', chatSchema);

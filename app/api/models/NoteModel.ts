import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    indexes: [{ title: 1 }, { userId: 1 }, { createdAt: -1 }],
  }
);

// Add compound index for better query performance
noteSchema.index({ userId: 1, createdAt: -1 });

// Update the updatedAt timestamp before saving
noteSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);

export default Note;

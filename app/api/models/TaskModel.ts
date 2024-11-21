import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: false,
    },
    time: {
      type: String,
      required: false,
    },
    subtasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subtask",
        required: false,
      },
    ],
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: false,
    },
    position: {
      type: Number,
      default: 0,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
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
    indexes: [{ title: 1 }, { userId: 1 }, { createdAt: -1 }, { position: 1 }],
  }
);

// Add compound index for better query performance
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ userId: 1, position: 1 });

// Update the updatedAt timestamp before saving
taskSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

export default Task;

import mongoose from "mongoose";

const SubtaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: Date,
      required: false,
    },
    task: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: false,
      },
    ],
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
SubtaskSchema.index({ userId: 1, createdAt: -1 });

// Update the updatedAt timestamp before saving
SubtaskSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Subtask =
  mongoose.models.Subtask || mongoose.model("Subtask", SubtaskSchema);

export default Subtask;

import mongoose from "mongoose";

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
}, {
  timestamps: true,
  indexes: [
    { name: 1 },
    { owner: 1 }
  ]
});

// Add compound index for better query performance
listSchema.index({ owner: 1, name: 1 });

const List = mongoose.models.List || mongoose.model("List", listSchema);

export default List;

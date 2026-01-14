import { Schema, model, Types } from "mongoose";
import IComment from "../interfaces/commentModel.js";

const commentSchema = new Schema<IComment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  blogId: {
    type: Schema.Types.ObjectId,
  },
  content: {
    type: String,
    required: [true, "content is required"],
    maxLength: [1000, "content must be less than 1000 character"],
  },
});

export default model<IComment>("Comment", commentSchema);

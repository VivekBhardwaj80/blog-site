import { Types, Schema, model } from "mongoose";
import {genSlug} from '../utils/index.js'
import IBlog from "../interfaces/blogModelInterface.js";

const blogSchema = new Schema<IBlog>({
  title: {
    type: String,
    required: [true, "Title is required"],
    maxLength: [180, "Title must be less than 180 character"],
  },
  slug: {
    type: String,
    required: [true, "slug is required"],
    unique: [true, "slug must be unique"],
  },
  content: {
    type: String,
    required: [true, "content is required"],
  },
  banner: {
    publicId: {
      type: String,
      required: [true, "Banner public id is required"],
    },
    url: {
      type: String,
      required: [true, "Banner URL is required"],
    },
    width: {
      type: Number,
      required: [true, "Banner width is required"],
    },
    height: {
      type: Number,
      required: [true, "Banner height is required"],
    },
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Author is required"],
  },
  viewsCount: {
    type: Number,
    default: 0,
  },
  likesCount: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: {
      values: ["draft", "published"],
      message: "{VALUE} is not supported",
    },
    default:'draft'
  },
},{timestamps:{
    createdAt:"publishedAt"
}});

blogSchema.pre('validate',function(){
  if(this.title && !this.slug){
    this.slug = genSlug(this.title)
  }
})

export default model<IBlog>('Blog',blogSchema)

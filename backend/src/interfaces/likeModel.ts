import {Types} from 'mongoose'

interface ILikeInterface {
    blogId?:Types.ObjectId;
    userId?:Types.ObjectId;
    commentId?:Types.ObjectId
}

export default ILikeInterface
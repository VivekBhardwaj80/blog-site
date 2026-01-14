import {Types,Schema,model} from 'mongoose'
import ILikeInterface from '../interfaces/likeModel.js'

const likeSchema = new Schema<ILikeInterface>({
    blogId:{
        type:Schema.Types.ObjectId

    },
    commentId:{
        type:Schema.Types.ObjectId
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }
})

export default model<ILikeInterface>('Likes',likeSchema)




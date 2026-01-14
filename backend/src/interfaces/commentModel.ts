import {Types} from 'mongoose'

interface IComment{
    blogId:Types.ObjectId,
    userId:Types.ObjectId,
    content:string,
}

export default IComment
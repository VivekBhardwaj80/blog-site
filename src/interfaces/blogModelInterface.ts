import {Types} from 'mongoose'

interface IBlog{
    title:string,
    slug:string,
    content:string,
    banner:{
        publicId:string,
        url:string,
        width:number,
        height:number,
    },
    author:Types.ObjectId,
    viewsCount:number,
    likesCount:number,
    commentsCount:number,
    status:'draft'|'published'
}

export default IBlog
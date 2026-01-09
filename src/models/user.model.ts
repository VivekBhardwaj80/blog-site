import {model, Schema} from 'mongoose'
import IUser from '../interfaces/userModelInterface.js'


const userSchema = new Schema<IUser>({
    username:{
        type:String,
        required:[true,"Username is required"],
        maxLength:[20,"Username must be less than 20 characters"],
        unique:[true,"Username must be unique"],
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:[true,"email must be unique"],
        maxLength:[50,"Email must be less than 50 characters"],
    },
    password:{
        type:String,
        required:[true,"password is required"],
        select:false,
    },
    role:{
        type:String,
        required:[true,"Role is required"],
        enum:{
            values:["admin","user"],
            message:"[value] is not supported"
        },
        default:"user"
    },
    firstName:{
        type:String,
        maxLength:[30, 'First name must be less than 30 characters']
    },
    lastName:{
        type:String,
        maxLength:[30, 'Last name must be less than 30 characters']
    },
    socialLinks:{
        website:{
            type:String,
            maxLength:[100, 'Website address must be less than 100 characters']
        },
        youtube:{
            type:String,
            maxLength:[100, 'Youtube channel URL must be less than 100 characters']
        },
        x:{
            type:String,
            maxLength:[100, 'X profile URL must be less than 100 characters']
        },
        facebook:{
            type:String,
            maxLength:[100, 'Facebook Profile URL must be less than 100 characters']
        },
        instagram:{
            type:String,
            maxLength:[100, 'Instagram profile URL must be less than 100 characters']
        },
        linkedIn:{
            type:String,
            maxLength:[100, 'LinkedIn profile URL must be less than 100 characters']
        },
        
    }
},{timestamps:true})

export default model<IUser>("User",userSchema)

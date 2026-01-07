interface IUser{
    firstName?:string;
    lastName:string;
    username:string;
    password:string;
    email:string;
    role:"admin" | "user";
    socialLinks?:{
        website?:string;
        facebook?:string;
        instagram?:string;
        x?:string;
        youtube?:string;
        linkedIn?:string;
    }
}

export default IUser
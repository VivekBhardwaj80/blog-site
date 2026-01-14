import mongoose from "mongoose";


const dbConnect = async():Promise<void>=>{
    try { 
        const uri = process.env.MONGO_URI 
        if(!uri){
            throw new Error("MOngo URI is not defined in env")
        }else{
            await mongoose.connect(uri)
            console.log("DB connect Successfully")
        }
    } catch (error:any) {
        console.log(error.message);
        process.exit(1)     
    }
}

const dbDisconnect=async():Promise<void>=>{
    try {
        await mongoose.disconnect()
    } catch (error) {
        console.log("error to disconnect DB");
        
    }
}

export {dbConnect, dbDisconnect}
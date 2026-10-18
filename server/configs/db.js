import mongoose from "mongoose";


const connectDb =async ()=>{
    try {
        mongoose.connection.on('connected',()=>console.log('Mongodb connected successfully'));
        await mongoose.connect(`${process.env.MONGODB_URI}/car-rental`)
    } catch (error) {
        console.log(error);
        
    }
}

export default connectDb;
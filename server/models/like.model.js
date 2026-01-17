import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    comment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment"
    },
    story:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Story"
    },
    likedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post"
    }
},{timestamps:true})

const Like=mongoose.model("Like",likeSchema);
export default Like;
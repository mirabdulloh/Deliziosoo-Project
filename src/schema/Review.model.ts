
import mongoose, {Schema} from "mongoose"; 


const reviewSchema = new Schema({
    memberId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Member",
      },
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
      orderId:{
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
      rating:{
        type: Number,
        default:0,
      },
      comment:{
        type:String,
      }


},{timestamps:true})

export default mongoose.model("review", reviewSchema)
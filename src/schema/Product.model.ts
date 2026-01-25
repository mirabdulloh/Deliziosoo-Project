import mongoose, { Schema } from "mongoose";
import { ProductCollection, ProductSize, ProductStatus, ProductVolume } from "../libs/enum/product.enum";


const ProductSchema = new Schema(
  {
    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.ACTIVE,
    },

    productCollection: {
      type: String,
      enum: ProductCollection,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },

    productPrice: {
      type: Number,
      required: true,
    },

    productLeftCount: {
      type: Number,
      required: true,
    },
    productSize: {
      type: String,
      enum: Object.values(ProductSize),
      default: ProductSize.NORMAL,
    },
    productVolume: {
      type: String,
      enum: ProductVolume,
    },
    productDesc: {
      type: String,
    },
    productImages: {
      type: [String],
      default: [],
    },
    productViews: {
      type: Number,
      default: 0,
    },
    productLikes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
); // createdAT, updatedAT ni beradi

ProductSchema.index(
  { productName: 1, productSize: 1, productVolume: 1 },
  { unique: true, sparse: true }
);
export default mongoose.model("Product", ProductSchema);

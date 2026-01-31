import { Types } from "mongoose";
import {
  ProductCollection,
  ProductSize,
  ProductStatus,
} from "../enum/product.enum";
import { PromotionEnum } from "../enum/promotion.enum";

/* ================= INPUTS ================= */

export interface ProductInput {
  productStatus?: ProductStatus;
  productCollection: ProductCollection;
  productName: string;
  productPrice: number;
  productPriceDiscount?: number;
  productLeftCount: number;
  productSize?: ProductSize;
  productVolume?: number;
  productDesc?: string;
  productImages?: string[];
  productViews?: number;
  productPromotion?: PromotionEnum;
}

export interface ProductInquiry {
  order: string;
  page: number;
  limit: number;
  productCollection?: ProductCollection;
  search?: string;
}

/* ================= ENTITY ================= */

export interface Product {
  _id: Types.ObjectId; // ✅ FIXED
  productStatus: ProductStatus;
  productCollection: ProductCollection;
  productName: string;
  productPrice: number;
  productPriceDiscount?: number;
  productLeftCount: number;
  productSize: ProductSize;
  productVolume: number;
  productDesc?: string;
  productImages: string[];
  productViews: number;
  productLikes: number;
  productPromotion: PromotionEnum;
  discountedPrice?: number;
  memberLiked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/* ================= UPDATE ================= */

export interface ProductUpdateInput {
  _id: Types.ObjectId; // ✅ FIXED
  productStatus?: ProductStatus;
  productCollection?: ProductCollection;
  productName?: string;
  productPrice?: number;
  productPriceDiscount?: number;
  productLeftCount?: number;
  productSize?: ProductSize;
  productVolume?: number;
  productDesc?: string;
  productImages?: string[];
  productViews?: number;
  productLikes?: number;
  productPromotion?: PromotionEnum;
}

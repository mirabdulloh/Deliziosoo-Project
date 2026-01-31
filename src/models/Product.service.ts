import { ProductCollection, ProductStatus } from "../libs/enum/product.enum";
import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import {
  Product,
  ProductInput,
  ProductInquiry,
  ProductUpdateInput,
} from "../libs/types/product";
import ProductModel from "../schema/Product.model";
import LikesModel from "../schema/Likes.model";
import { StatisticModifier, T } from "../libs/types/common";
import { ObjectId, Types } from "mongoose";
import ViewService from "./View.service";
import LikeService from "./Like.service";
import { ViewInput } from "../libs/types/view";
import { LikeInput } from "../libs/types/like";
import { ViewGroup, LikeGroup } from "../libs/enum/view.enum";
import {
  lookupAuthMemberLiked,
  addMemberLikedField,
  removeTemporaryLikeFields,
} from "../libs/utils/aggregation";

class ProductService {
  private readonly productModel;
  public viewService;
  public likeService;
  constructor() {
    this.productModel = ProductModel;
    this.viewService = new ViewService();
    this.likeService = new LikeService();
  }

  // ! For SPA */
  public async getProducts(
    inquiry: ProductInquiry,
    memberId?: Types.ObjectId | null,
  ): Promise<Product[]> {
    console.log("🔍 getProducts called with memberId:", memberId);
    
    const match: T = {
      productStatus: { $in: [ProductStatus.ACTIVE] },
    };

    if (inquiry.productCollection) {
      match.productCollection = inquiry.productCollection;
    }
    if (inquiry.search) {
      match.productName = { $regex: new RegExp(inquiry.search, "i") };
    }

    const sort: T =
      inquiry.order === "productPrice"
        ? { [inquiry.order]: 1 }
        : { [inquiry.order]: -1 };

    const pipeline: any[] = [
      { $match: match },
      { $sort: sort },
      { $skip: (inquiry.page * 1 - 1) * inquiry.limit },
      { $limit: inquiry.limit * 1 },
    ];

    // Add lookup for authenticated members
    if (memberId) {
      console.log("✅ Adding lookup for memberId:", memberId);
      const lookup = lookupAuthMemberLiked(memberId, "_id");
      console.log("📊 Lookup stage:", JSON.stringify(lookup, null, 2));
      if (lookup) pipeline.push(lookup);
    }

    // Add discountedPrice and memberLiked fields
    pipeline.push({
      $addFields: {
        discountedPrice: {
          $cond: {
            if: { $gt: ["$productPromotion", 0] },
            then: {
              $subtract: [
                "$productPrice",
                {
                  $multiply: [
                    "$productPrice",
                    { $divide: ["$productPromotion", 100] },
                  ],
                },
              ],
            },
            else: "$productPrice",
          },
        },
        ...(memberId ? { memberLiked: { $gt: [{ $size: "$meLiked" }, 0] } } : {}),
      },
    });

    // Remove temporary fields
    if (memberId) {
      pipeline.push(removeTemporaryLikeFields());
    }

    console.log("📋 Full getProducts pipeline stages:", pipeline.length);
    const result = await this.productModel.aggregate(pipeline).exec();
    console.log("📤 getProducts returned products count:", result.length);
    if (result.length > 0) {
      console.log("👀 First product memberLiked:", result[0].memberLiked);
    }

    if (!result || result.length === 0)
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async getPromotions(
    inquiry: ProductInquiry,
    memberId?: Types.ObjectId | null,
  ): Promise<Product[]> {
    const match: T = {
      productStatus: ProductStatus.PROMOTION,
    };

    if (inquiry.productCollection) {
      match.productCollection = inquiry.productCollection;
    }
    if (inquiry.search) {
      match.productName = { $regex: new RegExp(inquiry.search, "i") };
    }

    const sort: T =
      inquiry.order === "productPrice"
        ? { [inquiry.order]: 1 }
        : { [inquiry.order]: -1 };

    const pipeline: any[] = [
      { $match: match },
      { $sort: sort },
      { $skip: (inquiry.page * 1 - 1) * inquiry.limit },
      { $limit: inquiry.limit * 1 },
    ];

    // Add lookup for authenticated members
    if (memberId) {
      const lookup = lookupAuthMemberLiked(memberId, "_id");
      if (lookup) pipeline.push(lookup);
    }

    // Add discountedPrice and memberLiked fields
    pipeline.push({
      $addFields: {
        discountedPrice: {
          $subtract: [
            "$productPrice",
            {
              $multiply: [
                "$productPrice",
                { $divide: ["$productPromotion", 100] },
              ],
            },
          ],
        },
        ...(memberId ? { memberLiked: { $gt: [{ $size: "$meLiked" }, 0] } } : {}),
      },
    });

    // Remove temporary fields
    if (memberId) {
      pipeline.push(removeTemporaryLikeFields());
    }

    const result = await this.productModel.aggregate(pipeline).exec();

    if (!result || result.length === 0)
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async getFavoriteProducts(
    memberId: Types.ObjectId,
    inquiry: ProductInquiry,
    likeRefId?: Types.ObjectId,
  ): Promise<Product[]> {
    const safeMemberId =
      typeof memberId === "string" ? new Types.ObjectId(memberId) : memberId;

    const match: T = { memberId: safeMemberId, likeGroup: LikeGroup.PRODUCT };
    if (likeRefId) match.likeRefId = likeRefId;
    const sort: T = inquiry.order
      ? inquiry.order === "productPrice"
        ? { [inquiry.order]: 1 }
        : { [inquiry.order]: -1 }
      : { favoriteAt: -1 };

    const result = await LikesModel.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "products",
          localField: "likeRefId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $match: {
          "product.productStatus": {
            $in: [ProductStatus.ACTIVE, ProductStatus.PROMOTION],
          },
        },
      },
      {
        $addFields: {
          "product.favoriteAt": "$createdAt",
          "product.memberLiked": true,
          "product.discountedPrice": {
            $cond: {
              if: { $gt: ["$product.productPromotion", 0] },
              then: {
                $subtract: [
                  "$product.productPrice",
                  {
                    $multiply: [
                      "$product.productPrice",
                      { $divide: ["$product.productPromotion", 100] },
                    ],
                  },
                ],
              },
              else: "$product.productPrice",
            },
          },
        },
      },
      { $replaceRoot: { newRoot: "$product" } },
      { $sort: sort },
      { $skip: (inquiry.page * 1 - 1) * inquiry.limit },
      { $limit: inquiry.limit * 1 },
    ]).exec();

    if (!result || result.length === 0)
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async getProduct(
    memberId: Types.ObjectId | null,
    id: string,
  ): Promise<Product> {
    const productId = shapeIntoMongooseObjectId(id);

    const pipeline: any[] = [
      {
        $match: {
          _id: productId,
          productStatus: { $in: [ProductStatus.ACTIVE, ProductStatus.PROMOTION] },
        },
      },
    ];

    // Add lookup for authenticated members
    if (memberId) {
      const lookup = lookupAuthMemberLiked(memberId, "_id");
      if (lookup) pipeline.push(lookup);
    }

    // Add memberLiked field
    pipeline.push({
      $addFields: {
        ...(memberId ? { memberLiked: { $gt: [{ $size: "$meLiked" }, 0] } } : {}),
      },
    });

    // Remove temporary fields
    if (memberId) {
      pipeline.push(removeTemporaryLikeFields());
    }

    const products = await this.productModel.aggregate(pipeline).exec();

    if (!products || products.length === 0)
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    let result = products[0];

    // if authenticated user => first => view log
    const input: ViewInput = {
      memberId: memberId,
      viewRefId: productId,
      viewGroup: ViewGroup.PRODUCT,
    };
    if (memberId) {
      // check existence
      const existView = await this.viewService.checkViewExistence(input);
      console.log("exist!:", !!existView);

      if (!existView) {
        // insert new view
        console.log("planning to insert new view");
        await this.viewService.insertMemberView(input);
        await this.productModel
          .findByIdAndUpdate(
            productId,
            { $inc: { productViews: 1 } },
          )
          .exec();
        // Update result with incremented view count
        result.productViews = (result.productViews || 0) + 1;
      }
    }
    return result;
  }

  /** SSR */
  public async getAllProduct(): Promise<Product[]> {
    const result = await this.productModel.find().exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async createNewProduct(input: ProductInput): Promise<Product> {
    try {
      // Only include productVolume for DRINK collection
      if (input.productCollection !== ProductCollection.DRINK) {
        delete input.productVolume;
      }
      return await this.productModel.create(input);
    } catch (err) {
      console.error("error on createNewProduct Module", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async updateChosenProduct(
    id: String,
    input: ProductUpdateInput,
  ): Promise<Product> {
    // Only include productVolume for DRINK collection
    if (
      input.productCollection &&
      input.productCollection !== ProductCollection.DRINK
    ) {
      delete input.productVolume;
    }
    id = shapeIntoMongooseObjectId(id);
    const result = await this.productModel
      .findOneAndUpdate({ _id: id }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }

  public async updateProductPromotion(
    id: String,
    promotion: number,
  ): Promise<Product> {
    id = shapeIntoMongooseObjectId(id);

    // First get the product to get its current price
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    // Calculate discounted price if promotion is set
    let updateData: any = { productPromotion: promotion };

    if (promotion > 0) {
      const discountedPrice =
        product.productPrice - (product.productPrice * promotion) / 100;
      updateData.productPriceDiscount = Math.round(discountedPrice * 100) / 100; // Round to 2 decimals
    } else {
      updateData.productPriceDiscount = null; // Remove discount if no promotion
    }

    const result = await this.productModel
      .findOneAndUpdate({ _id: id }, updateData, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }

  public async productStatsEditor(input: StatisticModifier): Promise<Product> {
    const { _id, targetKey, modifier } = input;
    const result = await this.productModel
      .findByIdAndUpdate(
        _id,
        { $inc: { [targetKey]: modifier } },
        { new: true },
      )
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }

  public async likeTargetProduct(
    memberId: Types.ObjectId,
    likeRefId: Types.ObjectId,
  ): Promise<any> {
    const target: Product = await this.productModel
      .findOne({
        _id: likeRefId,
        productStatus: { $in: [ProductStatus.ACTIVE, ProductStatus.PROMOTION] },
      })
      .exec();
    if (!target) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    const input: LikeInput = {
      memberId: memberId,
      likeRefId: likeRefId,
      likeGroup: LikeGroup.PRODUCT,
    };
    const modifier: number = await this.likeService.toggleLike(input);
    const result = await this.productStatsEditor({
      _id: likeRefId,
      targetKey: "productLikes",
      modifier: modifier,
    });
    
    // Check if the current user has liked this product after toggle
    const memberLiked = await this.likeService.checkLikeExistence({
      memberId: memberId,
      likeRefId: likeRefId,
      likeGroup: LikeGroup.PRODUCT,
    });

    return {
      _id: result._id,
      productName: result.productName,
      productLikes: result.productLikes,
      memberLiked: memberLiked,
    };
  }
}

export default ProductService;

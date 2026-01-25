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
import { T } from "../libs/types/common";
import { ObjectId, Types } from "mongoose";
import ViewService from "./View.service";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enum/view.enum";

class ProductService {
  private readonly productModel;
  public viewService;
  constructor() {
    this.productModel = ProductModel;
    this.viewService = new ViewService();
  }

  // ! For SPA */
  public async getProducts(inquiry: ProductInquiry): Promise<Product[]> {
    const match: T = { productStatus: ProductStatus.ACTIVE };

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
    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        { $skip: (inquiry.page * 1 - 1) * inquiry.limit },
        { $limit: inquiry.limit * 1 },
      ])
      .exec();

    if (!result || result.length === 0)
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async getProduct(
    memberId: Types.ObjectId | null,
    id: string,
  ): Promise<Product> {
    const productId = shapeIntoMongooseObjectId(id);
    let result = await this.productModel
      .findOne({
        _id: productId,
        productStatus: ProductStatus.ACTIVE,
      })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

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
        result = await this.productModel
          .findByIdAndUpdate(
            productId,
            { $inc: { productViews: 1 } },
            { new: true },
          )
          .exec();
      }
      // increase  view
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
}

export default ProductService;

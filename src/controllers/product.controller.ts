import ProductService from "../models/Product.service";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { T } from "../libs/types/common";
import { json, Request, Response } from "express";
import { ProductInput, ProductInquiry } from "../libs/types/product";
import { AdminRequest, ExtendedRequest } from "../libs/types/member";
import { ProductCollection } from "../libs/enum/product.enum";
import { Types } from "mongoose";

const productService = new ProductService();

const productController: T = {};

// ! For SPA */

productController.getProducts = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getProducts:");
    console.log("🔑 req.member exists?", !!req.member);
    console.log("🔑 req.member._id:", req.member?._id);
    console.log("🔑 req.cookies:", Object.keys(req.cookies));
    
    const { page, limit, order, productCollection, search } = req.query;
    const inquiry: ProductInquiry = {
      order: String(order),
      page: Number(page),
      limit: Number(limit),
    };
    if (productCollection) {
      inquiry.productCollection = productCollection as ProductCollection;
    }
    if (search) inquiry.search = String(search);

    const memberId = req.member?._id ?? null;
    console.log("📤 Passing memberId to service:", memberId);
    const result = await productService.getProducts(inquiry, memberId);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("ERROR, getProducts:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.getPromotions = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getPromotions:");
    console.log("🔑 req.member exists?", !!req.member);
    console.log("🔑 req.member._id:", req.member?._id);
    
    const { page, limit, order, productCollection, search } = req.query;
    const inquiry: ProductInquiry = {
      order: String(order || "createdAt"),
      page: Number(page || 1),
      limit: Number(limit || 100),
    };
    if (productCollection) {
      inquiry.productCollection = productCollection as ProductCollection;
    }
    if (search) inquiry.search = String(search);

    const memberId = req.member?._id ?? null;
    console.log("📤 Passing memberId to service:", memberId);
    const result = await productService.getPromotions(inquiry, memberId);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("ERROR, getPromotions:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.getProduct = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getProduct:");
    const { id } = req.params;
    console.log("req.member:", req.member);

    const memberId = req.member?._id ?? null,
      result = await productService.getProduct(memberId, id);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("ERROR, getProduct:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

/** SSR */

productController.getAllProduct = async (req: Request, res: Response) => {
  try {
    console.log("getAllProduct:");
    const data = await productService.getAllProduct();
    res.render("products", { products: data });
  } catch (err) {
    console.log("ERROR, getAllProduct:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.getNewProductPage = async (req: Request, res: Response) => {
  try {
    return res.render("new_products");
  } catch (err) {
    console.log("ERROR getNewProductPage:", err);
    return res.redirect("/admin/product/all");
  }
};

// ! For Creation Products
productController.createNewProduct = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    console.log("createNewProduct:");
    if (!req.files?.length)
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);

    const data: ProductInput = req.body;
    data.productImages = req.files?.map((ele) => {
      return ele.path.replace(/\\/g, "/");
    });
    console.log("data on createNewProduct Module,", data);

    await productService.createNewProduct(data);
    res.send(
      `<script> alert("Successful creation!"); window.location.replace("/admin/product/all")</script> `,
    );
  } catch (err) {
    console.log("ERROR, createNewProduct:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace("/admin/product/all")</script> `,
    );
  }
};

// ! For Updating Products
productController.updateChosenProduct = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenProduct:");
    const id = req.params.id;

    const result = await productService.updateChosenProduct(id, req.body);

    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("ERROR, updateChosenProduct:", err);

    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// ! For Updating Product Promotion
productController.updateProductPromotion = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("updateProductPromotion:");
    const id = req.params.id;
    const { productPromotion } = req.body;

    if (productPromotion === undefined) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);
    }

    const result = await productService.updateProductPromotion(id, productPromotion);

    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("ERROR, updateProductPromotion:", err);

    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// ! Like Product
productController.likeTargetProduct = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("likeTargetProduct:");

    const { productId } = req.params;

    const memberId = req.member._id as Types.ObjectId;

    // ⭐ FIX HERE
    const likeRefId = new Types.ObjectId(productId);

    const result = await productService.likeTargetProduct(memberId, likeRefId);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("ERROR, likeTargetProduct:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// ! Favorite Products
productController.getFavoriteProducts = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("getFavoriteProducts:");
    const { page, limit, order, likeRefId } = req.query;

    const inquiry: ProductInquiry = {
      order: String(order),
      page: Number(page),
      limit: Number(limit),
    };

    const memberId = req.member._id as Types.ObjectId;
    const likeRefObjId = shapeIntoMongooseObjectId(likeRefId);

    const result = await productService.getFavoriteProducts(memberId, inquiry, likeRefObjId);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("ERROR, getFavoriteProducts:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};


export default productController;

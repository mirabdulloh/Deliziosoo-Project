export enum HttpCode {
  OK = 200,
  CREATED = 201,
  NOT_MODIFIED = 304,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export enum Message {
  SOMETHING_WENT_WRONG = "Something went wrong",
  NO_DATA_FOUND = "No Data Found",
  CREATE_FAILED = "Create Failed",
  UPDATE_FAILED = "Update Failed",
  REVIEW_ID_REQUIRED = "reviewId required",
  REVIEW_NOT_FOUND = "Review not found",
  UNAUTHORIZED = "Unauthorized",
  EDIT_TIME_EXPIRED = "Edit time expired",
  FORBIDDEN = "Forbidden",
  REVIEW_ALREADY_EXISTS = "Review already exists",
  PRODUCT_NOT_FOUND = "Product not found in your orders",
  ORDER_NOT_FINISHED = "Order is not finished",
  ORDER_ID_REQUIRED = "orderId required",
  PRODUCT_ID_REQUIRED = "productId required",
  INVALID_ACTION = "Invalid action",
  NO_RESERVATION = "NO_RESERVATION FOR THIS USER",
  CAN_RESERVE_ONE_IN_DAY = "You can reserve table one time in a day",
  NO_MEMBER_NICK = "No member with that member nick",
  TOKEN_CREATION_FAILED = "Token creation failed",
  USED_NICK_PHONE = "You are inserting already used phone or nick",
  BLOCKED_USER = "You Have Been BLocked, Contact Restaurant!",
  WRONG_PASSWORD = "Wrong Password, Please try again",
  NOT_AUTHENTICATED = "You are not authenticated, Please login first",
}

class Errors extends Error {
  public code: HttpCode;
  public message: Message;

  static standard = {
    code: HttpCode.INTERNAL_SERVER_ERROR,
    message: Message.SOMETHING_WENT_WRONG,
  };
  constructor(statusCode: HttpCode, statusMessage: Message) {
    super();
    ((this.code = statusCode), (this.message = statusMessage));
  }
}

export default Errors;

export enum HttpCode{
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

    NO_MEMBER_NICK = "No member with that member nick",
    TOKEN_CREATION_FAILED = "Token creation failed",
    USED_NICK_PHONE = 'You are inserting already used phone or nick',
    BLOCKED_USER = "You Have Been BLocked, Contact Restaurant!",
    WRONG_PASSWORD = 'Wrong Password, Please try again',
    NOT_AUTHENTICATED = "You are not authenticated, Please login first"
}

class Errors extends Error{
    public code: HttpCode;
    public message: Message;


    static standard ={
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: Message.SOMETHING_WENT_WRONG

    }
    constructor(statusCode:HttpCode,statusMessage:Message){
        super();
        this.code = statusCode,
        this.message = statusMessage
    }
}


export default Errors;
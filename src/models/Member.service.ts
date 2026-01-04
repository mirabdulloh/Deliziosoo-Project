import { MemberType } from "../libs/enum/member.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { LoginInput, Member, MemberInput } from "../libs/types/member";
import MemberModel from "../schema/Member.model";
import * as bcrypt from "bcryptjs";

class MemberService {
  private readonly memberModel;
  constructor() {
    this.memberModel = MemberModel;
  }

  public async processSignUp(input: MemberInput): Promise<Member> {
    const exist = await this.memberModel
      .findOne({ memberType: MemberType.RESTAURANT })
      .exec();
    console.log("exist:", exist);

    if (exist) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    console.log("before:", input.memberPassword);

    const salt = await bcrypt.genSalt();
    input.memberPassword = await bcrypt.hash(input.memberPassword, salt);
    console.log("after:", input.memberPassword);

    try {
      const result = await this.memberModel.create(input);
      result.memberPassword = "";
      return result;
    } catch (err) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async processLogin(input: LoginInput): Promise<Member> {
    const member = await this.memberModel
      .findOne(
        { memberNick: input.memberNick }, 
        { memberNick: 1, memberPassword: 1 }
      )
      .exec();
    console.log("member:", member);

    if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);

    const isMatch: boolean = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword
    );
    console.log("isMatch:", isMatch);
    if (!isMatch)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);

    return await this.memberModel.findById(member._id).exec();
  }
}

export default MemberService;

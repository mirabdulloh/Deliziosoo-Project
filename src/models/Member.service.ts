import { StatisticModifier, T } from "../libs/types/common";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { MemberStatus, MemberType } from "../libs/enum/member.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import {
  LoginInput,
  Member,
  MemberInput,
  memberUpdateInput,
} from "../libs/types/member";
import MemberModel from "../schema/Member.model";
import * as bcrypt from "bcryptjs";

class MemberService {
  private readonly memberModel;
  constructor() {
    this.memberModel = MemberModel;
  }

  // ! BSSR EJS
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
        { memberNick: 1, memberPassword: 1 },
      )
      .exec();
    console.log("member:", member);

    if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);

    const isMatch: boolean = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword,
    );
    console.log("isMatch:", isMatch);
    if (!isMatch)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);

    return await this.memberModel.findById(member._id).exec();
  }

  //!  For Admin Controlling Users */
  public async getUsers(): Promise<Member[]> {
    const result = await this.memberModel
      .find({ MemberType: MemberType.USER })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }

  public async updateChosenUser(input: memberUpdateInput): Promise<Member> {
    input._id = shapeIntoMongooseObjectId(input._id);
    const result = await this.memberModel
      .findByIdAndUpdate({ _id: input._id }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    return result;
  }

  public async updateAdminSettings(
    member: Member,
    input: MemberInput,
  ): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);

    const updateData: T = {};

    // only allow these fields
    if (input.memberNick) updateData.memberNick = input.memberNick;
    if (input.memberImage) updateData.memberImage = input.memberImage;

    const result = await this.memberModel.findOneAndUpdate(
      { _id: memberId, memberType: MemberType.RESTAURANT },
      updateData,
      { new: true },
    );

    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    return result;
  }

  // ! SPA REACT

  public async signUp(input: MemberInput): Promise<Member> {
    const salt = await bcrypt.genSalt();
    input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

    // Generate welcome coupon
    const couponCode = this.generateCouponCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

    try {
      const result = await this.memberModel.create({
        ...input,
        memberCoupon: {
          code: couponCode,
          discount: 5,
          isUsed: false,
          expiresAt: expiresAt,
        },
      });
      result.memberPassword = "";
      return result.toJSON();
    } catch (err) {
      console.error("ERROR: model: signUp", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
    }
  }

  private generateCouponCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "WELCOME";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  public async validateCoupon(
    member: Member,
    couponCode: string
  ): Promise<{ valid: boolean; discount: number; message: string }> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const memberData = await this.memberModel.findById(memberId).exec();

    if (!memberData || !memberData.memberCoupon || !memberData.memberCoupon.code) {
      return { valid: false, discount: 0, message: "No coupon available" };
    }

    const coupon = memberData.memberCoupon;

    if (coupon.code !== couponCode) {
      return { valid: false, discount: 0, message: "Invalid coupon code" };
    }

    if (coupon.isUsed) {
      return { valid: false, discount: 0, message: "Coupon already used" };
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return { valid: false, discount: 0, message: "Coupon has expired" };
    }

    return {
      valid: true,
      discount: coupon.discount,
      message: "Coupon is valid",
    };
  }

  public async login(input: LoginInput): Promise<Member> {
    // TODO: Consider member status later
    const member = await this.memberModel
      .findOne(
        {
          memberNick: input.memberNick,
          memberStatus: { $ne: MemberStatus.DELETE },
        }, // Filter
        { memberNick: 1, memberPassword: 1, memberStatus: 1 },
      )
      .exec(); // Projection
    console.log("member:", member);

    if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
    else if (member.memberStatus === MemberStatus.BLOCK) {
      throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
    }

    const isMatch: boolean = await bcrypt.compare(
      input.memberPassword, // max2020
      member.memberPassword, // dedefefwfw4fwfwfw4fwf
    );
    console.log("isMatch:", isMatch);
    if (!isMatch)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);

    // =========== ADD HERE ===========
    await this.memberModel.updateOne(
      { _id: member._id },
      { $set: { lastLoginAt: new Date(), lastActiveAt: new Date() } },
    );
    // =================================

    return await this.memberModel.findById(member._id).lean().exec();
  }

  public async addUserPoint(member: Member, point: number): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);

    const updatedMember = await this.memberModel
      .findOneAndUpdate(
        {
          _id: memberId,
          memberType: MemberType.USER,
          memberStatus: MemberStatus.ACTIVE,
        },
        { $inc: { memberPoints: point } },
        { new: true },
      )
      .exec();

    return updatedMember;
  }


  public async updateMember(
    member: Member,
    input: memberUpdateInput,
  ): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const updateData: T = {};

    if (typeof input.memberNick === "string" && input.memberNick.trim()) {
      updateData.memberNick = input.memberNick.trim();
    }

    if (typeof input.memberPhone === "string" && input.memberPhone.trim()) {
      updateData.memberPhone = input.memberPhone.trim();
    }

    if (typeof input.memberEmail === "string") {
      updateData.memberEmail = input.memberEmail.trim();
    }

    if (typeof input.memberAddress === "string") {
      updateData.memberAddress = input.memberAddress.trim();
    }

    if (typeof input.memberDesc === "string") {
      updateData.memberDesc = input.memberDesc.trim();
    }

    if (typeof input.memberImage === "string" && input.memberImage.trim()) {
      updateData.memberImage = input.memberImage;
    }

    if (typeof input.memberPassword === "string" && input.memberPassword.trim()) {
      const salt = await bcrypt.genSalt();
      updateData.memberPassword = await bcrypt.hash(input.memberPassword, salt);
    }

    if (Object.keys(updateData).length === 0) {
      return await this.getMemberDetail(member);
    }

    const result = await this.memberModel.findOneAndUpdate(
      { _id: memberId },
      { $set: updateData },
      { new: true },
    );
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }

  public async getMemberDetail(member: Member): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const result = await this.memberModel
      .findOne({ _id: memberId, memberStatus: MemberStatus.ACTIVE })
      .lean()
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async syncTotalOrders(
    member: Member,
    totalOrders: number,
  ): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const result = await this.memberModel
      .findOneAndUpdate(
        { _id: memberId },
        { $set: { totalOrders } },
        { new: true },
      )
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }

  public async markCouponAsUsed(
    member: Member,
    couponCode?: string,
  ): Promise<boolean> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const filter: T = { _id: memberId };
    if (couponCode) filter["memberCoupon.code"] = couponCode;

    const result = await this.memberModel.updateOne(
      filter,
      { $set: { "memberCoupon.isUsed": true } }
    );

    return result.modifiedCount > 0;
  }

  public async generateLoyaltyCoupon(member: Member): Promise<boolean> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const couponCode = this.generateLoyaltyCouponCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

    await this.memberModel.updateOne(
      { _id: memberId },
      {
        $set: {
          "memberCoupon.code": couponCode,
          "memberCoupon.discount": 5,
          "memberCoupon.isUsed": false,
          "memberCoupon.expiresAt": expiresAt,
        },
      }
    );
    console.log(`🎉 Loyalty coupon ${couponCode} generated for member ${memberId} (finished 5 more orders)`);
    return true;
  }

  private generateLoyaltyCouponCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "LOYAL5";
    for (let i = 0; i < 9; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
  public async memberStatsEdits(input: StatisticModifier): Promise<Member> {
		console.log('Executed');
		const { _id, targetKey, modifier } = input;
		return await this.memberModel.findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true }).exec();
	}
}

export default MemberService;

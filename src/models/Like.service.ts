import LikesModel from "../schema/Likes.model";
import { LikeInput } from "../libs/types/like";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";

class LikeService {
  private readonly likeModel;

  constructor() {
    this.likeModel = LikesModel;
  }

  public async toggleLike(input: LikeInput): Promise<number> {
    const search: T = { memberId: input.memberId, likeRefId: input.likeRefId };
    const exist = await this.likeModel.findOne(search).exec();
    let modifier = 1;

    if (exist) {
      await this.likeModel.findOneAndDelete(search).exec();
      modifier = -1;
    } else {
      try {
        await this.likeModel.create(input);
      } catch (err) {
        console.log("Error on LikeService Model", err);
        throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
      }
    }

    console.log(`---Like Modifier---- ${modifier}`);
    return modifier;
  }

  public async checkLikeExistence(input: LikeInput): Promise<boolean> {
    const { memberId, likeRefId } = input;
    const result = await this.likeModel.findOne({ memberId, likeRefId }).exec();
    return !!result;
  }

  // Bulk check for multiple products - useful for list views
  public async checkMultipleLikes(
    memberId: any,
    likeRefIds: any[],
    likeGroup: string,
  ): Promise<Map<string, boolean>> {
    const likes = await this.likeModel
      .find({
        memberId,
        likeRefId: { $in: likeRefIds },
        likeGroup,
      })
      .exec();

    const likeMap = new Map<string, boolean>();
    likes.forEach((like: any) => {
      likeMap.set(like.likeRefId.toString(), true);
    });

    return likeMap;
  }
}

export default LikeService;

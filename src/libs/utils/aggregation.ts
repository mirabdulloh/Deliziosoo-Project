import { Types } from "mongoose";
import { T } from "../types/common";
import { LikeGroup } from "../enum/view.enum";

/**
 * Helper function to create a MongoDB $lookup stage for checking if a member has liked a product
 * @param memberId - The member's ID (will be compared in the pipeline)
 * @param targetRefId - The field to use as the reference (default: '_id', can use '$fieldName' for nested)
 * @param likeGroup - The like group to filter by (default: PRODUCT)
 * @returns MongoDB $lookup aggregation stage
 */
export const lookupAuthMemberLiked = (
  memberId: Types.ObjectId | null,
  targetRefId: string = "_id",
  likeGroup: string = LikeGroup.PRODUCT
) => {
  if (!memberId) return null;

  return {
    $lookup: {
      from: "likes",
      let: {
        localLikeRefId: targetRefId.startsWith("$")
          ? targetRefId
          : `$${targetRefId}`,
        localMyFavorite: true,
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$likeRefId", "$$localLikeRefId"] },
                { $eq: ["$memberId", new Types.ObjectId(memberId)] },
                { $eq: ["$likeGroup", likeGroup] },
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            memberId: 1,
            likeRefId: 1,
            myFavorite: "$$localMyFavorite",
          },
        },
      ],
      as: "meLiked",
    },
  };
};

/**
 * Helper function to add memberLiked field to aggregation results
 * @returns MongoDB $addFields aggregation stage
 */
export const addMemberLikedField = () => {
  return {
    $addFields: {
      memberLiked: { $gt: [{ $size: "$meLiked" }, 0] },
    },
  };
};

/**
 * Helper function to remove temporary like fields
 * @returns MongoDB $project aggregation stage
 */
export const removeTemporaryLikeFields = () => {
  return {
    $project: {
      meLiked: 0,
    },
  };
};

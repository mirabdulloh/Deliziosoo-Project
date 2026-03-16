import AppSettingModel from "../schema/AppSetting.model";

class AppSettingService {
  private readonly appSettingModel;

  constructor() {
    this.appSettingModel = AppSettingModel;
  }

  public async getSettings() {
    const settings = await this.appSettingModel
      .findOneAndUpdate(
        { key: "global" },
        { $setOnInsert: { key: "global", loyaltyRewardCouponEnabled: true } },
        {
          new: true,
          upsert: true,
        },
      )
      .lean()
      .exec();

    return settings;
  }

  public async updateSettings(input: { loyaltyRewardCouponEnabled?: boolean }) {
    const settings = await this.appSettingModel
      .findOneAndUpdate(
        { key: "global" },
        {
          $set: {
            ...(input.loyaltyRewardCouponEnabled !== undefined
              ? { loyaltyRewardCouponEnabled: input.loyaltyRewardCouponEnabled }
              : {}),
          },
          $setOnInsert: { key: "global" },
        },
        {
          new: true,
          upsert: true,
        },
      )
      .lean()
      .exec();

    return settings;
  }

  public async isLoyaltyRewardCouponEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings?.loyaltyRewardCouponEnabled !== false;
  }
}

export default AppSettingService;

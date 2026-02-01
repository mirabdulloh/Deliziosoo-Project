

export interface T {
    [key:string]: any;
}

import { Types } from "mongoose";

export interface StatisticModifier {
	_id: Types.ObjectId;
	targetKey: string;
	modifier: number;
}

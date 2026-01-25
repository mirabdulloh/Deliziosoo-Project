

export interface T {
    [key:string]: any;
}

export interface StatisticModifier {
	_id: ObjectId;
	targetKey: string;
	modifier: number;
}

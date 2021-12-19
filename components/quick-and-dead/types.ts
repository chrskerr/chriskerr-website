
export enum Rounds {
	TWO = 2,
	THREE = 3,
	FOUR = 4,
	FIVE = 5,
}

export enum Type {
	ONE_HANDED = "One Handed",
	TWO_HANDED = "Two Handed"
}

export enum RepSplit {
	FIVES = "5",
	TENS = "10",
}

export type Day = {
	cycles: Rounds,
	swingType: Type,
	repSplit: RepSplit,
}

export type Week = ( Day | undefined )[]

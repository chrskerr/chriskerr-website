
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

export enum MinifiedType {
	ONE_HANDED = 1,
	TWO_HANDED = 2,
}

export enum RepSplit {
	FIVES = "5",
	TENS = "10",
}

export type Day = {
	rounds: Rounds,
	swingType: Type,
	repSplit: RepSplit,
}

export type MinifiedDay = {
	r: Rounds,
	t: MinifiedType,
	s: RepSplit,
}

export type MinifiedWeek = ( MinifiedDay | null )[]

export type Week = ( Day | null )[]

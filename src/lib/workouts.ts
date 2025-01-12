//

type Workout = {
	content: string;
	from?: number;
	to?: number;
};

// Touch the following shapes at least once per workout, at any intensity.
// - Skills
//   - Jumping & landing
//   - Single leg skipping
//   - Balance?
//   - Turkish get ups
// - Vertical push
//   - Barbell overhead press
//   - Kettlebell overhead press
//   - Handstand holds
//   - Kettlebell snatch
//   - Kettlebell clean and press
// - Horizontal push
//   - Push up
//   - Bench press
//   - Dip
// - Pull
//   - Band pull aparts
//   - Pull up
//   - Barbell row
// - Squat
//   - Air squat (warmup)
//   - Lunge (important)
//   - Barbell back squat
//   - Barbell front squat
//   - Barbell Overhead squat
// - Hip hinge
//   - Deadlift
//   - Kettlebell swing
//   - Single arm kettlebell swing
//   - Kettlebell snatch
//   - Kettlebell clean and press
// - Rotate / Anti-rotate
//   - Russian twist
//   - Hanging leg raise
//   - Turkish get ups
//   - Single arm farmers walk
//   - Single arm kettlebell swing

// Structure
// - Warmup of a skill and then 3-4 of the above movements
// - Main workout of the remainder of the above movements

const workouts: Workout[] = [
	{
		content: `
## Warm-up
- Turkish get ups
- Band pull aparts

## Main
- Dips
- Dumbbell lunges
- Kettlebell snatch`,
	},
	{
		content: `
## Warm-up
- Jumping & landing
- Push ups

## Main
- Overhead press
- Pull up
- Deadlift

## Finisher
- Single arms farmers walk`,
	},
	{
		content: `
## Warm-up
- Single leg skipping
- Handstand holds
- Band pull aparts
- Single arm kettlebell swing

## Main
- Barbell bench press
- Barbell back squat`,
	},
];

export function getWorkout(
	yearWeek: number,
	getRandomIndex: (maxIndex: number) => number,
): Workout {
	const filtered = workouts.filter(
		w =>
			(w.from == null || w.from >= yearWeek) &&
			(w.to == null || w.to <= yearWeek),
	);
	return filtered[getRandomIndex(filtered.length)]!;
}

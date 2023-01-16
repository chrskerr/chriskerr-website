import { marked } from 'marked';

const allWorkoutsMarkdown: Array<{ id: number; markdown: string }> = [
	{
		id: 1,
		markdown: `
# The (sorta) Quick and the Dead

Strength - deadlift and bench press:

- keep the weight the same across all sets, but do the prescribed reps below
- add 2.5kg each session on success
- deload by 10% at failure or almost-failure
- deadlift: 5, 3, 2 reps
- bench: 7, 4, 3 reps

Max rounds in 15 minutes:

- 10x over-speed^ two handed (32kg) or single handed kettlebell swings (24kg)
- 10x banded push ups
- short rest

^ accelerate the kettlebell downwards to increase its fall rate
`,
	},
];

export const allWorkouts = allWorkoutsMarkdown.map(workout => ({
	id: workout.id,
	html: marked.parse(workout.markdown),
}));

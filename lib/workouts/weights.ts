import { marked } from 'marked';

const allWeightsMarkdown: Array<{ id: string; markdown: string }> = [
	{
		id: '1',
		markdown: `
Deadlift, bench press & supinated lat pulldown:

- keep the weight the same across all sets, but do the prescribed reps below
- add 2.5kg each session on success
- deload by 10% at failure or almost-failure
- deadlift: 5, 3, 2 reps
- bench & supinated lat pulldown: 7, 4, 3 reps
`,
	},
	{
		id: '2',
		markdown: `
Total tension complex, presses:

- pick a kettlebell you can strictly press 6-8 times after a clean
- if below 32kg, consider using a heavier kettlebell for support when doing renegade row
- add one rep to press each set until you can no longer go up without compromising form, then go back down instead
- rest 90 seconds between sets

1 clean + *x presses*  + 1 squat + 1 renegade row per arm
`,
	},
	{
		id: '3',
		markdown: `
Total tension complex, squat:

- pick a kettlebell you can strictly press 6-8 times after a clean
- if below 32kg, consider using a heavier kettlebell for support when doing renegade row
- add one rep to press each set until you can no longer go up without compromising form, then go back down instead
- rest 90 seconds between sets

1 clean + 1 press + *x squats* + 1 renegade row per arm
`,
	},
];

export const allWeights = allWeightsMarkdown.map((workout, i) => ({
	id: workout.id,
	html: marked.parse(workout.markdown),
}));

const seenIds = new Set<string>();
for (const { id } of allWeightsMarkdown) {
	if (seenIds.has(id)) {
		throw new Error('Duplicate id!');
	}

	seenIds.add(id);
}

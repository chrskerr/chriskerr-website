import { marked } from 'marked';

const allFinishersMarkdown: Array<{ id: string; markdown: string }> = [
	{
		id: '1',
		markdown: `
- 3 sets of curls. Focus on form, TuT and contraction, not weight and reps
- 3 sets of pistol squats, 9 inch box or lower
`,
	},
	{
		id: '2',
		markdown: `
- 5 minutes of handstand practise
- 3 sets of pistol squats, 9 inch box or lower
`,
	},
	{
		id: '3',
		markdown: `
- 3 sets of one-hand push up progression
- 3 sets of unweighted dips, max reps
`,
	},
	{
		id: '4',
		markdown: `
- 3 sets of incline bench
- 3 sets of curls. Focus on form, TuT and contraction, not weight and reps
`,
	},
	{
		id: '5',
		markdown: `
- 3 sets of unweighted dips, max reps
- 3 sets of v-ups, max reps
`,
	},
	{
		id: '6',
		markdown: `
- 3 sets of curls. Focus on form, TuT and contraction, not weight and reps
- 3 sets of L-sit leg raises, pause at top 2sec
`,
	},
];

export const allFinishers = allFinishersMarkdown.map(workout => ({
	id: workout.id,
	html: marked.parse(workout.markdown),
}));

const seenIds = new Set<string>();
for (const { id } of allFinishersMarkdown) {
	if (seenIds.has(id)) {
		throw new Error('Duplicate id!');
	}

	seenIds.add(id);
}

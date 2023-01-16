import { marked } from 'marked';

const allWodsMarkdown: Array<{ id: string; markdown: string }> = [
	{
		id: '1',
		markdown: `
8 rounds, every 2 minutes on the minute

- 10x over-speed^ two handed (28kg) or single handed kettlebell swings (20kg)
- 10x over-speed^ push ups

^ make the lowering phase as fast as possible, push down if you can
`,
	},
	{
		id: '2',
		markdown: `
As many rounds as possible in 15 minutes:

- max calorie row in 60 seconds (each calorie counts as 1 "rep")
- turkish get-ups, alternating hand, 16kg, as many reps as need to hit 20 total "reps"
`,
	},
	{
		id: '3',
		markdown: `
Any cycle based cardio machine, 8 rounds of:

- 1 min, 90%+ effort
- 1 min rest, stay in gentle motion, eg, walking or slow cycle
`,
	},
	{
		id: '4',
		markdown: `
15 minutes on the stair-stepper machine.

- Every 90 seconds, do a max steps breath hold (hold the rails!) and then continue at the same walking pace to recover. 
- Keep breath as calm as possible while recovering. 
- Choose a pace which allows you to recover while breathing again.
`,
	},
	{
		id: '5',
		markdown: `
15 minutes run or cycle, indoors or outdoors.
`,
	},
	{
		id: '6',
		markdown: `
- 7 minutes of turkish get ups, practise but at a moderate weight
- 7 minutes of max rep snatches, 16kg
`,
	},
	{
		id: '7',
		markdown: `
5 rounds of:

- 10 v-ups
- 30 seconds max-effort row
- 90 seconds rest
`,
	},
	{
		id: '8',
		markdown: `
Every minute on the minute, 10 sets of 10 heavy kettlebell swings (32kg+)
`,
	},
	{
		id: '9',
		markdown: `
Every 2 minutes on the minute, 5 sets of 20 heavy kettlebell swings (32kg+)
`,
	},
	{
		id: '10',
		markdown: `
Every minute on the minute, 10 sets of 10 double kettlebell cleans
`,
	},
	{
		id: '11',
		markdown: `
Spend 15 minutes working on handstands
`,
	},
	{
		id: '12',
		markdown: `
- 3 sets of 8 reps incline bench, 1 minute rest
- 3 sets of 12 reps curls (any type), 1 minute rest
`,
	},
];

export const allWods = allWodsMarkdown.map(workout => ({
	id: workout.id,
	html: marked.parse(workout.markdown),
}));

const seenIds = new Set<string>();
for (const { id } of allWodsMarkdown) {
	if (seenIds.has(id)) {
		throw new Error('Duplicate id!');
	}

	seenIds.add(id);
}

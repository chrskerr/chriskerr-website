import { marked } from 'marked';

const allRunningMarkdown: Array<{ id: string; markdown: string }> = [
	{
		id: '1',
		markdown: `
10, 8, 6, 4, 2 mins effort with 2mins - 30secs rest between
`,
	},
	{
		id: '2',
		markdown: `
Halves - 20mins, 10mins, 5mins, 2 1/2 min efforts. Rest 2 1/2 Mins, 2 mins, 1 1/2 mins
`,
	},
	{
		id: '3',
		markdown: `
Alex hill repeats for 32 mins of work (recovery jog back down)
`,
	},
	{
		id: '4',
		markdown: `
5-7 x effort for 5 mins, recover 2 mins 
`,
	},
	{
		id: '5',
		markdown: `
Trail + lake loop x 3-5. Rest 3mins between
`,
	},
	{
		id: '6',
		markdown: `
Technique drills + 200m controlled repeats 6-16 depending on technique. Rest 2 mins after each
`,
	},
	{
		id: '7',
		markdown: `
400m repeats - 3 x (4x 400m with 1 min rest), rest 4 mins
`,
	},
	{
		id: '8',
		markdown: `
2 x 20 mins, rest 5 mins between
`,
	},
	{
		id: '9',
		markdown: `
6-8 x 600m rest 1:30 between each
`,
	},
	{
		id: '10',
		markdown: `
4 x 1km effort, recovery jog 600m
`,
	},
];

export const allRunning = allRunningMarkdown.map(workout => ({
	id: workout.id,
	html: marked.parse(workout.markdown),
}));

const seenIds = new Set<string>();
for (const { id } of allRunningMarkdown) {
	if (seenIds.has(id)) {
		throw new Error('Duplicate id!');
	}

	seenIds.add(id);
}

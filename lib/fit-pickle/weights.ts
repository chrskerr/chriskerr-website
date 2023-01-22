import { marked } from 'marked';

const allWeightsMarkdown: Array<{ id: string; markdown: string }> = [
	{
		id: '1',
		markdown: `
1. 5x10 swings
2. 5x5 Bench
3. 3x12 Incline bench

Optionals: 3x20 single leg calf raises, 3x20 elevated single leg bridging
`,
	},
	{
		id: '2',
		markdown: `
1. 5x5 e/s snatches
2. 5x5 Chin-ups
3. 3x8 Dips

Optionals: 3x8 dead hang leg raises, 3x20 weighted calf rasies
`,
	},
	{
		id: '3',
		markdown: `
1. 3x12 Dumbbell Bulgarian split squats
2. 5x5 Handstand push-ups
3. 3x12 Single leg hamstring deadlift

Optionals: 3x20 single leg calf raises, 3x20 elevated single leg bridging
`,
	},
	{
		id: '4',
		markdown: `
1. 5x5 Pull-ups
2. 3x12 Curls
3. 3x40sec Handstand holds

Optionals: 3x20 Deadbugs, 3x10 supermans
`,
	},
	{
		id: '5',
		markdown: `
1. 3x8 DB Cossack squats
2. 3x8 DB overhead press
3. 3x12 DB lateral raises

Optionals: 3x20 Deadbugs, 3x10 supermans
`,
	},
	{
		id: '6',
		markdown: `
1. 5x5 Handstand pushups
2. 3x12 Decline pushups
3. EMOM assault bike x 7 effort mins

Optionals: 3x20 weighted calf rasies, handstand skills practice
`,
	},
];

export const allWeights = allWeightsMarkdown.map(workout => ({
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

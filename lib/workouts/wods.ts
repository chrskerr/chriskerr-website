import { marked } from 'marked';

const allWodsMarkdown: Array<{ id: number; markdown: string }> = [
	{
		id: 1,
		markdown: `
8 rounds, every 2 minutes on the minute

- 10x over-speed^ two handed (28kg) or single handed kettlebell swings (20kg)
- 10x over-speed^ push ups
- 10x dumbbell curls

^ make the lowering phase as fast as possible, push down if you can
`,
	},
	{
		id: 2,
		markdown: `
8 rounds, every 2 minutes on the minute

- 10x over-speed^ two handed (28kg) or single handed kettlebell swings (20kg)
- 10x over-speed^ push ups
- 10x dumbbell curls

^ make the lowering phase as fast as possible, push down if you can
`,
	},
];

export const allWods = allWodsMarkdown.map(workout => ({
	id: workout.id,
	html: marked.parse(workout.markdown),
}));

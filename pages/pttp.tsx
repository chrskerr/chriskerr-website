import { ReactElement, useEffect, useState } from 'react';

import { NextSeo } from 'next-seo';

const title = 'PTTP tracker';

export default function EMDR(): ReactElement {
	return (
		<>
			<NextSeo
				title={title}
				description={title}
				canonical="https://www.chriskerr.dev/pttp"
				noindex
			/>
			<div className="display-width">
				<h2 className="mb-4 text-3xl">{title}</h2>
				<ul className="ml-4 list-disc">
					<li>5 reps @ next weight</li>
					<li>5 reps @ 90%</li>
					<li>Increase weight by 2.5kg if easy</li>
					<li>Reduce weight by 7.5kg when hard or tired</li>
				</ul>
			</div>
			<div className="display-width divider-before" />

			<ExerciseBlock
				label="Deadlift"
				storageKey="deadlift"
				tempo="0030"
				className="mb-8"
			/>
			<ExerciseBlock label="Bench" storageKey="bench" tempo="3030" />
		</>
	);
}

function ExerciseBlock({
	label,
	tempo,
	storageKey,
	className,
}: {
	label: string;
	tempo: string;
	storageKey: string;
	className?: string;
}) {
	const [value, setValue] = useState(0);

	useEffect(() => {
		const newValue = localStorage.getItem(storageKey);
		if (newValue && !isNaN(Number(newValue))) {
			setValue(Number(newValue));
		}
	}, []);

	useEffect(() => {
		if (value) {
			localStorage.setItem(storageKey, String(value));
		}
	}, [value]);

	return (
		<div className={`${className || ''} display-width`}>
			<h3 className="mb-2 text-2xl">{label}</h3>
			<p className="mb-4">tempo {tempo}</p>
			<div className="flex flex-col items-start gap-4 mb-4">
				<label>
					Next: <input type="text" disabled value={value} />
				</label>
				<label>
					90%:{' '}
					<input
						className="ml-[10px]"
						type="text"
						disabled
						value={to2dot5(value * 0.9)}
					/>
				</label>
				<label>
					80%:{' '}
					<input
						className="ml-[10px]"
						type="text"
						disabled
						value={to2dot5(value * 0.8)}
					/>
				</label>
				<button
					className="button"
					onClick={() => setValue(d => d + 2.5)}
				>
					Progress (+2.5kg)
				</button>
				<button
					className="button"
					onClick={() => setValue(d => d - 7.5)}
				>
					Deload (-7.5kg)
				</button>
			</div>
		</div>
	);
}

function to2dot5(input: number): number {
	return (Math.round((input * 4) / 10) / 4) * 10;
}

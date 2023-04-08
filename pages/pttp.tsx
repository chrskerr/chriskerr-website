import { ReactElement, useEffect, useState } from 'react';

import { NextSeo } from 'next-seo';

const title = 'PTTP tracker';

export default function EMDR(): ReactElement {
	const [deadlift, setDeadlift] = useState('');

	useEffect(() => {
		const newDeadlift = localStorage.getItem('deadlift');
		if (newDeadlift && !isNaN(Number(newDeadlift))) {
			setDeadlift(newDeadlift);
		}
	}, []);

	useEffect(() => {
		if (deadlift) {
			localStorage.setItem('deadlift', deadlift);
		}
	}, [deadlift]);

	const nextDeadlift = Math.ceil((Number(deadlift) + 0.0001) / 2.5) * 2.5;

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
			<div className="display-width">
				<h3 className="mb-2 text-2xl">Deadlift</h3>
				<p className="mb-4">tempo 0030</p>
				<div className="flex items-end justify-center gap-4 mb-4">
					<button
						className="button"
						onClick={() =>
							setDeadlift(d => String(Number(d) - 7.5))
						}
					>
						-7.5
					</button>
					<label>
						<input
							disabled
							className="w-[120px]"
							type="text"
							value={deadlift}
						/>
					</label>
					<button
						className="button"
						onClick={() =>
							setDeadlift(d => String(Number(d) + 2.5))
						}
					>
						+2.5
					</button>
				</div>
				<div className="flex flex-col gap-1">
					<label>
						Next:{' '}
						<input type="text" disabled value={nextDeadlift} />
					</label>
					<label>
						90%:{' '}
						<input
							className="ml-[10px]"
							type="text"
							disabled
							value={Math.floor(nextDeadlift * 0.9 * 2) / 2}
						/>
					</label>
					<label>
						80%:{' '}
						<input
							className="ml-[10px]"
							type="text"
							disabled
							value={Math.floor(nextDeadlift * 0.8 * 2) / 2}
						/>
					</label>
				</div>
			</div>
		</>
	);
}

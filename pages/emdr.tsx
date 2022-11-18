import { ChangeEvent, memo, ReactElement, useEffect, useState } from 'react';

import { NextSeo } from 'next-seo';
import padStart from 'lodash/padStart';

const title = 'EMDR Dot';

export default function EMDR(): ReactElement {
	const [transitionDurationSec, setTransitionDurationSec] = useState<
		number | string
	>(2);

	const [timeOnPageMs, updateTimeOnPageMs] = useState(0);

	function handleDurationChange(e: ChangeEvent<HTMLInputElement>) {
		const parsedValue = parseFloat(e.target.value);
		if (parsedValue) {
			setTransitionDurationSec(Math.max(Math.min(parsedValue, 10), 0));
		}
		if (!e.target.value) {
			setTransitionDurationSec('');
		}
	}

	useEffect(() => {
		const renderedAt = Date.now();
		const interval = window.setInterval(() => {
			updateTimeOnPageMs(Date.now() - renderedAt);
		}, 250);

		return () => {
			window.clearInterval(interval);
		};
	}, []);

	return (
		<>
			<NextSeo
				title={title}
				description={title}
				canonical="https://www.chriskerr.dev/emdr"
			/>
			<div className="display-width">
				<h2 className="mb-4 text-3xl">{title}</h2>
				<p className="mb-4">
					Watch the dot, help your brain process whatever is bothering
					it. This isn&apos;t my science, I just wanted a simple dot
					to watch.
				</p>
				<p className="mb-4">
					Try to not move you head, only moving your eyes.
				</p>
				<label>
					Interval (seconds):
					<input
						type="number"
						className="ml-4"
						onChange={handleDurationChange}
						min={0}
						max={10}
						step={0.25}
						value={transitionDurationSec}
					/>
				</label>
			</div>
			<div className="display-width divider-before" />
			<div className="relative flex flex-col flex-1 w-full px-12">
				<div className="absolute text-lg top-4 right-16">
					{formatDuration(timeOnPageMs)}
				</div>
				<EMDRDot durationSec={transitionDurationSec} />
			</div>
		</>
	);
}

const EMDRDot = memo(function EMDRDot({
	durationSec,
}: {
	durationSec: number | string;
}): ReactElement {
	const [step, setStep] = useState(0);

	function handleTransitionEnd() {
		setStep(state => state + 1);
	}

	useEffect(() => {
		setTimeout(() => {
			setStep(1);
		}, 200);
	}, []);

	const className = `w-full flex-1 flex transition-transform will-change-transform ease-[cubic-bezier(0.37,0,0.63,1)] ${
		step % 4 === 1 ? 'translate-x-[calc(100%-50px)] translate-y-[15%]' : ''
	} ${step % 4 === 2 ? 'translate-y-[calc(85%-50px)]' : ''} ${
		step % 4 === 3
			? 'translate-x-[calc(100%-50px)] translate-y-[calc(85%-50px)]'
			: ''
	} ${step % 4 === 0 ? 'translate-y-[15%]' : ''}`;

	return (
		<div
			className={className}
			style={{
				transitionDuration: `${durationSec || 2}s`,
			}}
			onTransitionEnd={handleTransitionEnd}
		>
			<div className="bg-black w-[50px] h-[50px] rounded-full" />
		</div>
	);
});

function formatDuration(durationMs: number): string {
	const totalSeconds = Math.floor(durationMs / 1000);

	const minutes = padStart(String(Math.floor(totalSeconds / 60)), 2, '0');
	const seconds = padStart(String(totalSeconds % 60), 2, '0');

	return `${minutes}:${seconds}`;
}

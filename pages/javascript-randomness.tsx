import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { NextSeo } from 'next-seo';
import dynamic from 'next/dynamic';
import {
	chunkSize,
	numDataGroups,
	Data,
	sampleSizes,
} from 'components/javascript-randomness/helpers';

const Chart = dynamic(() => import('components/javascript-randomness/chart'));

const title = 'Javascript Random Number Generation';

export default function JavascriptRandomness(): ReactElement {
	const [data, setData] = useState<Data[]>();
	const [samples, setSamples] = useState(1_000);

	const [loading, setLoading] = useState(false);
	const [loaded, setLoaded] = useState(0);

	const worker = useRef<undefined | Worker>();

	const shouldBreak = useRef(false);

	const processLoop = useCallback(
		async (
			updatedData: Data[],
			count: number,
			i: number,
		): Promise<Data[]> => {
			console.log(!!worker);
			return await new Promise<Data[]>(resolve => {
				if (!worker.current) {
					worker.current = new Worker(
						new URL(
							'../components/javascript-randomness/create-data.worker.ts',
							import.meta.url,
						),
					);
				}
				worker.current.addEventListener(
					'message',
					({ data }) => {
						setData(data);
						setLoaded((i + 1) * chunkSize);

						resolve(data);
					},
					{ once: true },
				);

				worker.current.addEventListener('error', () => {
					shouldBreak.current = true;
					resolve([]);
				});

				worker.current.postMessage({
					updatedData,
					count: Math.min(count, chunkSize),
				});
			});
		},
		[],
	);

	const generate = async (count: number) => {
		if (!worker) return;

		setLoading(true);
		setLoaded(0);

		shouldBreak.current = false;

		let updatedData = new Array(numDataGroups)
			.fill(0)
			.map<Data>((v, i) => ({
				label: String(i),
				math: 0,
				mathRaw: 0,
				crypto: 0,
				cryptoRaw: 0,
			}));

		const numChunks = Math.ceil(count / chunkSize);

		for (let i = 0; i < numChunks; i++) {
			updatedData = await processLoop(updatedData, count, i);

			if (shouldBreak.current) break;
		}

		setLoading(false);
	};

	useEffect(() => {
		return () => {
			shouldBreak.current = true;
		};
	}, []);

	return (
		<>
			<NextSeo
				title={title}
				description="A window into the various methods that Javascript can use to generate random numbers"
				canonical={`${process.env.NEXT_PUBLIC_URL_BASE}/javascript-randomness`}
			/>
			<div className="display-width">
				<h2 className="mb-4 text-3xl">{title}</h2>
				<p className="mb-4">
					I&apos;ve been using Math.Random(), and didn&apos;t feel
					that it was actually giving me results that were that
					random.
				</p>
				<p className="mb-4">
					Since this is almost definitely an illusion based upon a
					very small number of results (less than 10), I created this
					comparison of the distribution of the various methods that
					Javascript can use to generate random numbers.
				</p>
				<p className="mb-4">
					Runs in a Web Worker, because it seemed like an interesting
					way to approach it.
				</p>
			</div>
			<div className="display-width divider-before">
				<div
					className={`flex flex-col items-start ${
						loading ? 'opacity-60' : ''
					}`}
				>
					<p className="mb-2">How many samples?</p>
					<div className="sm:columns-2">
						{sampleSizes.map(({ label, value }) => (
							<div key={label} className="flex items-center mb-1">
								<input
									className="mr-2"
									id={label}
									value={value}
									name={label}
									type="radio"
									checked={samples === value}
									disabled={loading}
									onChange={e =>
										!loading &&
										setSamples(Number(e.target.value))
									}
								/>
								<label htmlFor={label}>{label}</label>
							</div>
						))}
					</div>
					<button
						className="mt-8 button"
						onClick={() => !loading && generate(samples)}
						disabled={loading}
					>
						{loading
							? `Processing: ${Math.floor(
									(loaded / samples) * 100,
							  )}%`
							: 'Generate!'}
					</button>
				</div>
				<div>
					<button
						className="mt-4 button"
						onClick={() => (shouldBreak.current = true)}
						disabled={!loading}
					>
						Stop
					</button>
				</div>
			</div>
			<div className="display-width divider-before">
				{data && <Chart data={data} />}
			</div>
		</>
	);
}

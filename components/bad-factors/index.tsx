import {
	ChangeEventHandler,
	ReactElement,
	useEffect,
	useRef,
	useState,
} from 'react';
import { NextSeo } from 'next-seo';

import { IWorkerReturn, CustomWorker } from './worker';
import Script from 'next/script';

const title = 'Finding Factors, the hard way';

type Result = { result: number[]; durationMs: number };

export default function BadFactors(): ReactElement {
	const [numberToFactor, setNumberToFactor] = useState(BigInt(0));

	const [loading, setLoading] = useState(false);

	const webWorker = useRef<undefined | CustomWorker>();
	const goWorker = useRef<
		undefined | WebAssembly.WebAssemblyInstantiatedSource
	>();

	const handleChange: ChangeEventHandler<HTMLInputElement> = e => {
		try {
			setNumberToFactor(
				BigInt(
					Math.min(
						parseInt(e.target.value.replaceAll(/\D/g, '')),
						250_000_000,
					),
				),
			);
		} catch {
			setNumberToFactor(BigInt(0));
		}
	};

	function formatInput(value: BigInt): string {
		return format(Number(value));
	}

	async function getWorkerFactors(input: BigInt): Promise<Result> {
		const start = new Date().valueOf();
		const result = await new Promise<number[]>(resolve => {
			if (!webWorker.current) {
				webWorker.current = new Worker(
					new URL('./worker.ts', import.meta.url),
				);
			}
			webWorker.current.addEventListener(
				'message',
				({ data }: IWorkerReturn) => {
					resolve(data);
				},
				{ once: true },
			);

			webWorker.current.addEventListener('error', () => {
				resolve([]);
			});

			webWorker.current.postMessage(input);
		});

		return { result, durationMs: new Date().valueOf() - start };
	}

	async function getGoFactors(input: BigInt): Promise<Result> {
		const goInstance = await initGoWorker();

		console.log(input);
		console.log(goInstance.exports.run);

		const start = new Date().valueOf();

		const result = [1];

		return { result, durationMs: new Date().valueOf() - start };
	}

	const generate = async (input: BigInt) => {
		setLoading(true);

		const [workerFactors, goFactors] = await Promise.all([
			getWorkerFactors(input),
			getGoFactors(input),
		]);

		console.log(workerFactors, goFactors);

		setLoading(false);
	};

	async function initGoWorker() {
		if (!goWorker.current) {
			// eslint-disable-next-line no-undef
			const go = new Go();
			goWorker.current = await WebAssembly.instantiateStreaming(
				fetch('./worker.wasm'),
				go.importObject,
			);
		}

		return goWorker.current.instance;
	}

	useEffect(() => {
		if (!webWorker.current) {
			webWorker.current = new Worker(
				new URL('./worker.ts', import.meta.url),
			);
		}
	}, []);

	return (
		<>
			<NextSeo
				title={title}
				description="A speed comparison of a few JS tools on a badly written number factoring algorithm"
				canonical={`${process.env.NEXT_PUBLIC_URL_BASE}/bad-factors`}
			/>
			<Script src="./wasm_exec.js" onLoad={initGoWorker} />
			<div className="display-width">
				<h2 className="mb-4 text-3xl">{title}</h2>
				<p className="mb-4">
					I wanted an excuse to try out WASM, but didn&apos;t have any
					good ideas.
				</p>
				<p className="mb-4">
					So I wrote the same, extremely basic, factor finding
					algorithm in a few tools to get an idea for how fast they
					each run.
				</p>
			</div>
			<div className="display-width divider-before">
				<div
					className={`flex flex-col items-start ${
						loading ? 'opacity-60' : ''
					}`}
				>
					<label>
						Number to factor
						<input
							type="text"
							className="ml-4"
							value={formatInput(numberToFactor)}
							onChange={handleChange}
						/>
					</label>
					<button
						className="mt-8 button"
						onClick={() => !loading && generate(numberToFactor)}
						disabled={loading}
					>
						{loading ? `Processing` : 'Generate!'}
					</button>
				</div>
			</div>
			<div className="display-width divider-before">
				<p>
					Results coming soon.... check the console, I&apos;ve
					probably left them there until I finish it.
				</p>
			</div>
		</>
	);
}

const { format } = Intl.NumberFormat('en-AU');

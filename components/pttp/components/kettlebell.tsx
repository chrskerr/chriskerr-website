import { useLocalStorageState } from '../hooks';
import { Interval } from '../timing';

import { availableKettlebells } from '../helpers/availableKettlebells';
import { Container } from './container';

type KettlebellExerciseProps = {
	label: string;
	storageKey: string;
	scheme: string;
};

export function KettlebellExerciseBlock(props: KettlebellExerciseProps) {
	const { label, storageKey, scheme } = props;

	const [value, setValue] = useLocalStorageState(storageKey, 16);

	function progress() {
		setValue(d => {
			const weights = Object.keys(availableKettlebells).sort((a, b) =>
				a.localeCompare(b),
			);
			const nextKb = weights.find(weight => Number(weight) > d);
			return nextKb ? Number(nextKb) : d;
		});
	}

	function deload() {
		setValue(d => {
			const weights = Object.keys(availableKettlebells).sort((a, b) =>
				b.localeCompare(a),
			);
			const prevKb = weights.find(weight => Number(weight) < d);
			return prevKb ? Number(prevKb) : d;
		});
	}

	const backgroundColor = availableKettlebells[String(value)] ?? '#000';

	return (
		<Container label={label}>
			<p className="mb-4">{scheme}</p>

			<div className="flex flex-col items-start gap-4 mb-4 whitespace-pre">
				<div>
					<p>Weight:</p>
					<div className="flex items-center">
						<div
							style={{ backgroundColor }}
							className="w-[24px] mr-2 aspect-square border rounded"
							aria-label={`Kettlebell colour indicator ${backgroundColor}`}
						/>
						<p>{value}kg</p>
					</div>
				</div>

				<button className="button" onClick={progress}>
					Progress
				</button>
				<button className="button" onClick={deload}>
					Deload
				</button>

				<Interval />
			</div>
		</Container>
	);
}

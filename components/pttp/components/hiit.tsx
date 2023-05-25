import { Interval } from '../timing';

import { Container } from './container';

type HIITExerciseProps = {
	label: string;
	instructions: string;

	/**
	 * @default 60
	 */
	intervalDurationSeconds?: number;

	/**
	 * @default 10
	 */
	intervalCount?: number;

	/**
	 * defaults to ['left', 'right']
	 */
	leftRightLabels?: [string, string] | null;
};

export function HIITExerciseBlock(props: HIITExerciseProps) {
	const { label, instructions } = props;

	return (
		<Container label={label}>
			<p className="mb-4">{instructions}</p>

			<div className="mb-4 ">
				<Interval
					leftRightLabels={props.leftRightLabels}
					count={props.intervalCount}
					durationSeconds={props.intervalDurationSeconds}
				/>
			</div>
		</Container>
	);
}

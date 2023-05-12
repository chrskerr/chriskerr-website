import padStart from 'lodash/padStart';

export function createTimeString(secondsElapsed: number): string {
	if (!secondsElapsed) return '0:00';

	const seconds = secondsElapsed % 60;
	const minutes = Math.floor(secondsElapsed / 60);

	return `${minutes}:${padStart(String(seconds), 2, '0')}`;
}

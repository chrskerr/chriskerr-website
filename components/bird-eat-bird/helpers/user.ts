import { gameHeight, getDefaultMousePos } from '../constants';
import { Element } from 'types/bird-eat-bird';
import { moveElement } from './elements';
import { getImage } from './images';
import { getHeightFromTargetWidth } from './sizing';

export async function getUser(canvas: HTMLCanvasElement): Promise<Element> {
	const img = await getImage('bald_eagle.svg');
	const width = 75;
	const height = getHeightFromTargetWidth(img, width);

	const { x, y } = getDefaultMousePos(canvas);

	return {
		type: 'user',
		img,
		width,
		height,
		x,
		y: y - height / 2,
		yVelocity: 0,
		xVelocity: 0,
	};
}

const damping = 0.95;
const edgeSize = 100;

export function moveUser(
	user: Element,
	mouseY: number,
	mouseX: number,
	timestampGap: number,
	canvas: HTMLCanvasElement,
	viewPortHeightOffset: number,
): {
	updatedUser: Element;
	updatedViewPortHeightOffset: number;
} {
	const yDistanceFromUser =
		mouseY - user.y - user.height / 2 + viewPortHeightOffset;
	const yVelocityChange = (yDistanceFromUser / 50_000) * timestampGap;
	const yVelocity = (user.yVelocity + yVelocityChange) * damping;

	const xDistanceFromUser = mouseX - user.x - user.width / 2;
	const xVelocityChange = (xDistanceFromUser / 200_000) * timestampGap;
	const xVelocity = Math.min(user.xVelocity + xVelocityChange) * damping;

	const updatedUser = moveElement(
		user,
		timestampGap,
		canvas.width,
		yVelocity,
		xVelocity,
	);

	const userBottom = updatedUser.y + user.height;

	let updatedViewPortHeightOffset = viewPortHeightOffset;
	if (userBottom + edgeSize > viewPortHeightOffset + canvas.height) {
		updatedViewPortHeightOffset =
			Math.min(userBottom + edgeSize, gameHeight) - canvas.height;
	} else if (updatedUser.y - edgeSize < viewPortHeightOffset) {
		updatedViewPortHeightOffset = Math.max(updatedUser.y - edgeSize, 0);
	}

	return {
		updatedUser,
		updatedViewPortHeightOffset,
	};
}

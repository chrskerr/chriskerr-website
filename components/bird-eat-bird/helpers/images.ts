export const getImage = async (name: string): Promise<HTMLImageElement> => {
	const img = new Image();

	await new Promise(resolve => {
		img.onload = () => {
			resolve(undefined);
		};
		img.onerror = () => {
			throw new Error(`${name} failed to load`);
		};
		img.src = `images/bird-eat-bird/${name}`;
	});

	return img;
};

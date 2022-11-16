import { ReactElement, useEffect, useState } from 'react';

import { NextSeo } from 'next-seo';

const title = 'EMDR Dot';

export default function EMDR(): ReactElement {
	const [isMovingRight, setIsMovingRight] = useState(false);

	function onMoveFinish() {
		setIsMovingRight(state => !state);
	}

	useEffect(() => {
		setIsMovingRight(true);
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
					it.
				</p>
				<p className="mb-4">
					Try to not move you head, only moving your eyes.
				</p>
				<p className="mb-4">
					This isn&apos;t my science, I just wanted a simple dot to
					watch.
				</p>
			</div>
			<div className="display-width divider-before" />
			<div className="flex items-center flex-1 w-full px-12">
				<div
					className={`w-full flex transition-transform will-change-transform duration-[3s] ease-[cubic-bezier(0.37,0,0.63,1)] ${
						isMovingRight ? 'translate-x-[calc(100%-100px)]' : ''
					}`}
					onTransitionEnd={onMoveFinish}
				>
					<div className="bg-black w-[50px] h-[50px] rounded-full" />
				</div>
			</div>
		</>
	);
}

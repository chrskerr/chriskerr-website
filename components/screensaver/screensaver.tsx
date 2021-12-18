
import React, { ReactElement, useEffect, useRef, useState } from "react";
import throttle from "lodash/throttle";

const delaySeconds = 45;
const baseMult = 5;
const getMult = ( positive: boolean ) => {
	const base = Math.abs( baseMult + ( Math.random() * 2 * baseMult ) - baseMult );
	return positive ? base : -1 * base;
};

let lastRenderedFrameTimestamp = 0;

export default function Screensaver (): ReactElement {
	const latestTimestamp = useRef( new Date().valueOf());
	const [ running, setIsRunning ] = useState( false );
	
	useEffect(() => {
		const interval = window.setInterval(() => {
			const now = new Date().valueOf(); 
			if ( now > ( latestTimestamp.current + delaySeconds * 1000 )) {
				if ( !running ) setIsRunning( true );
			} else {
				if ( running ) setIsRunning( false );
			}
		}, 1000 );

		const resetTimestamp = throttle(() => {
			latestTimestamp.current = new Date().valueOf();
			setIsRunning( false );
		}, 500, { leading: true, trailing: true });

		window.addEventListener( "scroll", resetTimestamp, false );
		window.addEventListener( "keypress", resetTimestamp, false );
		window.addEventListener( "touchmove", resetTimestamp, false );
		window.addEventListener( "click", resetTimestamp, false );
		window.addEventListener( "pointermove", resetTimestamp, false );
		window.addEventListener( "mousemove", resetTimestamp, false );

		return () => {
			window.removeEventListener( "scroll", resetTimestamp, false );
			window.removeEventListener( "keypress", resetTimestamp, false );
			window.removeEventListener( "touchmove", resetTimestamp, false );
			window.removeEventListener( "click", resetTimestamp, false );
			window.removeEventListener( "pointermove", resetTimestamp, false );
			window.removeEventListener( "mousemove", resetTimestamp, false );
			window.clearInterval( interval );
		};

	}, []);

	const [ positions, setPositions ] = useState({
		xMult: getMult( true ),
		x: 0,
		yMult: getMult( true ),
		y: 0,
	});

	const positionsRef = useRef( positions );
	const runningRef = useRef( running );
	const $_logo = useRef<HTMLDivElement>( null );

	useEffect(() => {
		positionsRef.current = positions;
		runningRef.current = running;
	}, [ positions, running ]);

	const updatePositions = ( timestamp: number ) => {
		if ( timestamp && timestamp - lastRenderedFrameTimestamp >= 50 ) {
			lastRenderedFrameTimestamp = timestamp;

			let { x, xMult, y, yMult } = positionsRef.current;

			if ( x <= 0 ) {
				xMult = getMult( true );
				yMult = getMult( yMult > 0 );
			}
			else if ( x + ( $_logo.current?.clientWidth || 0 ) >= window.innerWidth ) {
				xMult = getMult( false );
				yMult = getMult( yMult > 0 );
			}
		
			if ( y <= 0 ) {
				xMult = getMult( xMult > 0 );
				yMult = getMult( true );
			}
			else if ( y + ( $_logo.current?.clientHeight || 0 ) >= window.innerHeight ) {
				xMult = getMult( xMult > 0 );
				yMult = getMult( false );
			}

			x = x + xMult;
			y = y + yMult;

			setPositions({ x, y, xMult, yMult });
		}

		if ( runningRef.current ) requestAnimationFrame( updatePositions );
	};

	useEffect(() => {
		if ( running ) updatePositions( 0 );
	}, [ running ]);

	if ( !running ) return <div></div>;

	return (
		<div className="fixed inset-0 z-50 bg-white">
			<div className="relative w-full h-full">
				<div className="absolute top-0 left-0 transition-transform duration-[50ms]" style={{ transform: `translateX( ${ positions.x }px ) translateY( ${ positions.y }px )` }}>
					<div ref={ $_logo }>
						<h1 className="text-8xl">CK</h1>
					</div>
				</div>
			</div>
		</div>
	);
}
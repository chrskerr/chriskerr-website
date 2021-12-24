
import { ReactElement, useState } from "react";
import { NextSeo } from "next-seo";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import( "components/javascript-randomness/chart" ));

export type Data = {
	label: string,
	mathRaw: number,
	math: number,
	cryptoRaw: number,
	crypto: number,
}

const numDataGroups = 20;

const getCryptoRandomNumbers = ( count: number ): number[] => {
	return Array.from( crypto.getRandomValues( new Uint8Array( count ))).map( curr => Math.floor(( curr / 256 ) * numDataGroups ));
};

const getMathRandomNumbers = ( count: number ): number[] => {
	return new Array( count )
		.fill( 0 )
		.map(() => Math.floor( Math.random() * numDataGroups ));
};

const newDataSummary = ( mode: "math" | "crypto", count: number ): Record<string, number> => {
	const numbers = mode === "math" ?
		getMathRandomNumbers( count ) :
		getCryptoRandomNumbers( count );
	
	return numbers.reduce<Record<string, number>>(( acc, curr ) => {
		return {
			...acc,
			[ curr ]: ( acc[ curr ] || 0 ) + 1,
		};
	}, {});
};

const chunkSize = 1_000;

const processLoop = async ( data: Data[]): Promise<Data[]> => {
	return await new Promise( resolve => {
		setTimeout(() => {
			const newMathSummary = newDataSummary( "math", chunkSize );
			const newCryptoSummary = newDataSummary( "crypto", chunkSize );

			let totalMathRaw = 0;
			let totalCryptoRaw = 0;

			const normalisedData: Data[] = data.map(( datum ) => {
				const mathRaw = datum.mathRaw + ( newMathSummary[ datum.label ] || 0 );
				const cryptoRaw = datum.cryptoRaw + ( newCryptoSummary[ datum.label ] || 0 );

				totalMathRaw += mathRaw;
				totalCryptoRaw += cryptoRaw;
				
				return { ...datum, mathRaw, cryptoRaw };
			}).map( datum => ({
				...datum,
				math: datum.mathRaw / totalMathRaw * 100,
				crypto: datum.cryptoRaw / totalCryptoRaw * 100,
			}));

			resolve( normalisedData );
		}, 0 );
	});
};

const updateData = async ( count: number ): Promise<Data[]> => {
	const emptyData = new Array( numDataGroups )
		.fill( 0 )
		.map<Data>(( v, i ) => ({ label: String( i ), math: 0, mathRaw: 0, crypto: 0, cryptoRaw: 0 }));

	const numChunks = Math.ceil( count / chunkSize );
	let updatedData = emptyData;

	for ( let i = 0; i < numChunks; i ++ ) {
		updatedData = await processLoop( updatedData );
	}

	return updatedData;
};

const title = "Javascript Random Number Generation";

const sampleSizes = [
	{ label: "Ten", value: 10 },
	{ label: "One Hundred", value: 100 },
	{ label: "One Thousand", value: 1_000 },
	{ label: "Ten Thousand", value: 10_000 },
	{ label: "One Hundred Thousand (this'll take a sec)", value: 100_000 },
	{ label: "One Million (this'll take a while)", value: 1_000_000 },
	{ label: "Ten Million (this might not finish...)", value: 10_000_000 },
	{ label: "One Hundred Million (don't choose this one)", value: 100_000_000 },
];


export default function JavascriptRandomness (): ReactElement {
	const [ data, setData ] = useState<Data[]>();
	const [ samples, setSamples ] = useState( 1_000 );

	const [ loading, setLoading ] = useState( false );

	const generate = async ( count: number ) => {
		setLoading( true );
		setData( await updateData( count ));
		setLoading( false );
	};

	return (
		<>
			<NextSeo 
				title={ title }
				description="A window into the various methods that Javascript can use to generate random numbers"
				canonical="https://www.chriskerr.com.au/javascript-randomness"
			/>
			<div className="display-width">
				<h2 className="mb-4 text-3xl">{ title }</h2>
				<p className="mb-4">I&apos;ve been using Math.Random(), and didn&apos;t feel that it was actually giving me results that were that random.</p>		
				<p className="mb-4">Since this is almost definitely an illusion based upon a very small number of results (less than 10), I created this comparison of the distribution of the various methods that Javascript can use to generate random numbers.</p>		
			</div>
			<div className="display-width divider-before">
				<div className={ `flex flex-col items-start ${ loading ? "opacity-60" : "" }` }>
					<p className="mb-2">How many samples?</p>
					<div className="sm:columns-2">
						{ sampleSizes.map(({ label, value }) => (
							<div key={ label } className="flex items-center mb-1">
								<input className="mr-2" id={ label } value={ value } name={ label } type="radio" checked={ samples === value } disabled={ loading } onChange={ e => !loading && setSamples( Number( e.target.value )) } />
								<label htmlFor={ label }>{label}</label>
							</div>
						))}
					</div>
					<button className="mt-8 button" onClick={ () => !loading && generate( samples )} disabled={ loading }>
						{ loading ? "Loading..." : "Generate!" }
					</button>
				</div>
			</div>
			<div className="display-width divider-before">
				{ data && <Chart data={ data } /> }
			</div>
		</>	
	);
}


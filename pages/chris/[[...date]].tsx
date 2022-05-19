import { withAuth } from 'components/finance/helpers';
import { addDays, format, formatISO, parseISO, subDays } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { firestore } from 'lib/firebase-admin';
import { GetServerSideProps } from 'next';
import { ChangeEvent, useEffect, useState } from 'react';
import {
	addMissingKeys,
	collectionName,
	getLabel,
	IData,
	saveUpdate,
} from 'lib/chris';
import Link from 'next/link';

interface IChrisNeckIndex {
	data: IData;
}

const gridClasses =
	'grid w-full grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 justify-items-center items-center';

export default function ChrisNeckIndex({ data }: IChrisNeckIndex) {
	const { id, ...initialValues } = data;

	const yesterday = formatISO(subDays(parseISO(id), 1), {
		representation: 'date',
	});
	const isToday = formatISO(new Date(), { representation: 'date' }) === id;
	const tomorrow = formatISO(addDays(parseISO(id), 1), {
		representation: 'date',
	});

	const [values, setValues] = useState<Omit<IData, 'id'>>(initialValues);
	const [wasError, setWasError] = useState(false);

	const updateValue = (key: string) => {
		return async (e: ChangeEvent<HTMLInputElement>) => {
			setValues(v => {
				const newValues = Object.entries(v).reduce<Omit<IData, 'id'>>(
					(acc, [currKey, currValue]) => ({
						...acc,
						[currKey]: Number(
							currKey == key ? e.target.value : currValue || 0,
						),
					}),
					v,
				);
				(async () => {
					const { error } = await saveUpdate({ id, ...newValues });
					setWasError(error);
				})();
				return newValues;
			});
		};
	};

	useEffect(() => {
		setValues(initialValues);
	}, [id]);

	return (
		<>
			<div className="display-width">
				<h2 className="mb-4 text-3xl">Chris&apos;s Neck Journal</h2>
				<div className="flex items-center justify-between w-full">
					<div className="flex items-center">
						<Link href={`/chris/${yesterday}`} passHref>
							<a className="mr-4 transition-colors cursor-pointer hover:text-brand">
								&larr;
							</a>
						</Link>
						<p className="text-2xl">
							{format(parseISO(id), 'dd MMMM yyyy')}
						</p>
						{!isToday && (
							<Link href={`/chris/${tomorrow}`} passHref>
								<a className="ml-4 transition-colors cursor-pointer hover:text-brand">
									&rarr;
								</a>
							</Link>
						)}
					</div>
					<div className="flex items-center">
						<Link href="/chris/analysis" passHref>
							<a className="text-xl transition-colors cursor-pointer hover:text-brand">
								Analysis
							</a>
						</Link>
					</div>
				</div>
				{wasError && (
					<p className="mt-4 text-red-500">
						Something went wrong while saving
					</p>
				)}
			</div>
			<div className="display-width divider-before">
				<div className={gridClasses}>
					<p className="font-bold">Label</p>
					<p className="font-bold">None</p>
					<p className="font-bold">Not much</p>
					<p className="font-bold">Some</p>
					<p className="font-bold">Lots</p>
				</div>
				{Object.entries(values).map(([key, value]) => {
					return (
						<div key={key} className={`${gridClasses} mt-4`}>
							<p className="text-center">
								{getLabel(Number(key))}
							</p>
							{[0, 1, 2, 3].map(i => (
								<input
									id={`${key}-${i}`}
									key={`${key}-${i}`}
									className="cursor-pointer"
									type="radio"
									name={key}
									value={i}
									checked={value === i}
									onChange={updateValue(key)}
								/>
							))}
						</div>
					);
				})}
			</div>
		</>
	);
}

export const getServerSideProps: GetServerSideProps<IChrisNeckIndex> = async ({
	req,
	res,
	query,
}) => {
	let dateStr = formatISO(utcToZonedTime(new Date(), 'Australia/Sydney'), {
		representation: 'date',
	});

	if (query.date?.[0]) {
		try {
			dateStr = formatISO(parseISO(query.date[0]), {
				representation: 'date',
			});
		} catch {
			//
		}
	}

	if (query.date?.[0] && query.date?.[0] !== dateStr) {
		return {
			redirect: {
				destination: `/chris/${dateStr}`,
				permanent: true,
			},
		};
	}

	const data = await withAuth(req, res, async () => {
		const docs = await firestore
			.collection(collectionName)
			.where('id', '==', dateStr)
			.get();

		if (docs.docs[0]) {
			const docData = docs.docs[0]?.data();
			return docData as Partial<IData>;
		}

		await firestore.collection(collectionName).add({ id: dateStr });
		return { id: dateStr } as Partial<IData>;
	});

	if (!data) {
		return {
			redirect: {
				destination: `/finance`,
				permanent: false,
			},
		};
	}

	return {
		props: {
			data: addMissingKeys(data),
		},
	};
};

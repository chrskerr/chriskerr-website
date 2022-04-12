import { withAuth } from 'components/finance/helpers';
import { formatISO } from 'date-fns';
import { firestore } from 'lib/firebase-admin';
import { GetServerSideProps } from 'next';
import {
	addMissingKeys,
	collectionName,
	IData,
	config,
	createSummaryByLabel,
	createSummaryByTag,
	tags,
	createSummaryByUpsetAndLabel,
	getLabel,
} from 'lib/kate';
import Link from 'next/link';
import startCase from 'lodash/startCase';
import { useState } from 'react';
import ComparisonGraph from 'components/kate/comparison-graph';

interface IKateFoodAnalyse {
	data: IData[];
}

const keys = Object.keys(config).sort((a, b) =>
	getLabel(Number(a)).localeCompare(getLabel(Number(b))),
);

function toPercentage(input: number): string {
	return `${Math.floor(input * 100) || 0}%`;
}

function createRatios(input: {
	hadUpset: number;
	notUpset: number;
	tummyDays: number;
	totalDays: number;
}): {
	has: number;
	not: number;
} {
	return {
		has: input.hadUpset / input.tummyDays || 0,
		not: input.notUpset / (input.totalDays - input.tummyDays) || 0,
	};
}

const hasThreshold = 0.75;
const differenceThreshold = 0.15;

export default function KateFoodAnalyse({ data }: IKateFoodAnalyse) {
	const today = formatISO(new Date(), { representation: 'date' });

	const [tummyThreshold, setTummyThreshold] = useState<1 | 2 | 3>(2);
	const [threshold, setThreshold] = useState<1 | 2 | 3>(3);

	const summaryByLabel = createSummaryByLabel(data);
	const summaryByTag = createSummaryByTag(data, tummyThreshold, threshold);
	const summaryByUpsetAndLabel = createSummaryByUpsetAndLabel(
		data,
		tummyThreshold,
		threshold,
	);

	return (
		<>
			<div className="display-width">
				<h2 className="mb-4 text-3xl">Kate&apos;s Food Journal</h2>
				<div className="flex items-center justify-between w-full">
					<div className="flex items-center">
						<Link href={`/kate/${today}`} passHref>
							<a className="mr-4 text-xl transition-colors cursor-pointer hover:text-brand">
								Today
							</a>
						</Link>
					</div>
				</div>
			</div>
			<div className="display-width divider-before">
				<div className="grid grid-cols-4 mb-12">
					<p className="text-xl">Days of data</p>
					<span className="text-3xl">{data.length}</span>
				</div>
				<div className="grid grid-cols-4 mb-12">
					<div />
					<p className="font-bold">Not much, or more</p>
					<p className="font-bold">Some, or more</p>
					<p className="font-bold">Lots</p>
					<p className="text-xl">Upset Tummy Days</p>
					<p className="text-3xl">
						{summaryByLabel[1][1]}
						<span className="ml-4 text-xl">
							{toPercentage(summaryByLabel[1][1] / data.length)}
						</span>
					</p>
					<p className="text-3xl">
						{summaryByLabel[1][2]}
						<span className="ml-4 text-xl">
							{toPercentage(summaryByLabel[1][2] / data.length)}
						</span>
					</p>
					<p className="text-3xl">
						{summaryByLabel[1][3]}
						<span className="ml-4 text-xl">
							{toPercentage(summaryByLabel[1][3] / data.length)}
						</span>
					</p>
				</div>
				<p className="pb-4 text-xl">Settings</p>
				<div className="grid items-center grid-cols-2 gap-1 mb-12">
					<label>Tummy Upset Threshold</label>
					<select
						value={String(tummyThreshold)}
						onChange={e =>
							setTummyThreshold(
								Number(e.target.value) as 1 | 2 | 3,
							)
						}
					>
						<option value="1">Not much</option>
						<option value="2">Some</option>
						<option value="3">Lots</option>
					</select>
					<label>Type Threshold</label>
					<select
						value={String(threshold)}
						onChange={e =>
							setThreshold(Number(e.target.value) as 1 | 2 | 3)
						}
					>
						<option value="1">Not much</option>
						<option value="2">Some</option>
						<option value="3">Lots</option>
					</select>
				</div>
				<p className="pb-4 text-xl">By Type</p>
				<table className="w-full mb-12 text-left table-fixed">
					<thead>
						<tr>
							<th className="text-left">Stimuli *</th>
							<th>Days upset</th>
							<th>Days not upset</th>
							<th>Difference **</th>
						</tr>
					</thead>
					<tbody>
						{tags
							.sort((a, b) => a.localeCompare(b))
							.map(tag => {
								if (tag === 'wellbeing') return false;

								const tagData = summaryByTag[tag];

								const { has, not } = createRatios({
									...tagData,
									tummyDays:
										summaryByLabel[1][tummyThreshold],
									totalDays: data.length,
								});

								const difference = Math.max(has - not, 0);

								return (
									<tr key={tag}>
										<td className="text-left">
											{startCase(tag)}
										</td>
										<td>
											<span
												className={`px-2 ${
													has >= hasThreshold
														? 'bg-red-400'
														: ''
												}`}
											>
												{toPercentage(has)}
											</span>
										</td>
										<td>
											<span
												className={`px-2 ${
													not >= hasThreshold
														? 'bg-green-400'
														: ''
												}`}
											>
												{toPercentage(not)}
											</span>
										</td>
										<td>
											<span
												className={`px-2 ${
													difference >=
													differenceThreshold
														? 'bg-blue-400'
														: ''
												}`}
											>
												{toPercentage(difference)}
											</span>
										</td>
									</tr>
								);
							})}
					</tbody>
				</table>
				<p className="pb-4 text-xl">By Tag</p>
				<table className="w-full mb-4 text-left table-fixed">
					<thead>
						<tr>
							<th className="text-left">Stimuli *</th>
							<th>Days upset</th>
							<th>Days not upset</th>
							<th>Difference **</th>
						</tr>
					</thead>
					<tbody>
						{keys.map(key => {
							const label = getLabel(Number(key));
							if (label === 'wellbeing') return false;

							const unitData = summaryByUpsetAndLabel[key];
							if (!unitData) return;

							const { has, not } = createRatios({
								...unitData,
								tummyDays: summaryByLabel[1][tummyThreshold],
								totalDays: data.length,
							});

							const difference = Math.max(has - not, 0);

							return (
								<tr key={key}>
									<td className="text-left">
										{startCase(label)}
									</td>
									<td>
										<span
											className={`px-2 ${
												has >= hasThreshold
													? 'bg-red-400'
													: ''
											}`}
										>
											{toPercentage(has)}
										</span>
									</td>
									<td>
										<span
											className={`px-2 ${
												not >= hasThreshold
													? 'bg-green-400'
													: ''
											}`}
										>
											{toPercentage(not)}
										</span>
									</td>
									<td>
										<span
											className={`px-2 ${
												difference >=
												differenceThreshold
													? 'bg-blue-400'
													: ''
											}`}
										>
											{toPercentage(difference)}
										</span>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				<p className="pb-2 text-sm">
					* For each stiumuli, the percentage of days which Kate had
					an upset tummy (or not upset tummy) after having experienced
					it on that same day or the day before.
				</p>
				<p className="pb-2 text-sm">
					** The percentage of days which experienced that stimuli,
					minus the percentage of days not upset. Intended to
					highlight rows which had a larger impact on upsetness than
					not-upsetness.
				</p>

				<ComparisonGraph data={data} />
			</div>
		</>
	);
}

export const getServerSideProps: GetServerSideProps<IKateFoodAnalyse> = async ({
	req,
	res,
}) => {
	const data = await withAuth(req, res, async () => {
		const docs = await firestore.collection(collectionName).get();

		return docs.docs
			.map(doc => {
				return addMissingKeys(doc.data());
			})
			.sort((a, b) => a.id.localeCompare(b.id));
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
			data,
		},
	};
};

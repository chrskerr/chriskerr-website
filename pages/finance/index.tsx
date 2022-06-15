import { ReactElement, useEffect, useState } from 'react';
import { NextSeo } from 'next-seo';

import { UpApiReturn } from 'types/finance';
import Finance, { DisplayModes, Period } from 'components/finance';
import { GetServerSideProps } from 'next';
import { fetchTransactionsHelper } from 'components/finance/helpers';
import Link from 'next/link';
import { IFinanceFetchApiBody } from 'pages/api/finance/fetch';

interface Props {
	initialData: UpApiReturn | null;
}

const defaultPeriod = 'month';

export default function FinancesPage({ initialData }: Props): ReactElement {
	const [password, setPassword] = useState('');
	const [data, setData] = useState<UpApiReturn | null>(initialData);
	const [loading, setLoading] = useState(false);

	const [displayMode, setDisplayMode] = useState<DisplayModes>('monotone');
	const [period, setPeriod] = useState<Period>(defaultPeriod);

	async function fetchAndSetData(period: Period) {
		setLoading(true);
		try {
			const body: IFinanceFetchApiBody = { period };
			const res = await fetch('/api/finance/fetch', {
				headers: new Headers({
					api_key: password,
					'content-type': 'application/json',
				}),
				credentials: 'include',
				method: 'POST',
				body: JSON.stringify(body),
			});
			if (res.ok) {
				setData(await res.json());
			}
		} catch (e) {
			console.error(e);
		}
		setLoading(false);
	}

	const handleLogin = async () => {
		if (!password) return;
		fetchAndSetData(period);
	};

	useEffect(() => {
		if (data) {
			fetchAndSetData(period);
		}
	}, [period]);

	return (
		<>
			<NextSeo noindex={true} nofollow={true} />
			<div className="flex items-center justify-between display-width">
				<div>
					<h2 className="mb-4 text-3xl">Our Finances</h2>
					<Link href="/finance/nab" passHref>
						<a className="hover:underline text-brand">
							Report NAB balances
						</a>
					</Link>
				</div>
				<div className="flex flex-col sm:flex-row">
					<label className="flex flex-col sm:mr-4">
						Period:
						<select
							value={period}
							onChange={e => setPeriod(e.target.value as Period)}
							className="mt-2"
						>
							<option value="week">Weekly</option>
							<option value="month">Monthly</option>
						</select>
					</label>
					<label className="flex flex-col mt-4 sm:mt-0">
						Chart display mode:
						<select
							value={displayMode}
							onChange={e =>
								setDisplayMode(e.target.value as DisplayModes)
							}
							className="mt-2"
						>
							<option value="monotone">Curved</option>
							<option value="step">Stepped</option>
						</select>
					</label>
				</div>
			</div>
			<div className="px-4 sm:px-16 divider-before">
				{loading ? (
					<p>Loading</p>
				) : data ? (
					<Finance
						data={data}
						displayMode={displayMode}
						period={period}
					/>
				) : (
					<>
						<input
							type="password"
							placeholder="Please enter password"
							autoComplete="current-password"
							value={password}
							onChange={e => setPassword(e.target.value)}
							disabled={loading}
						/>
						<button
							className="ml-4 button"
							onClick={handleLogin}
							disabled={loading}
						>
							Login
						</button>
					</>
				)}
			</div>
		</>
	);
}

export const getServerSideProps: GetServerSideProps = async context => {
	const initialData = await fetchTransactionsHelper(
		context.req,
		context.res,
		defaultPeriod,
	);

	const props: Props = {
		initialData,
	};

	return {
		props,
	};
};

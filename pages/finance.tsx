import { ReactElement, useState } from 'react';
import { NextSeo } from 'next-seo';

import { UpApiReturn } from 'types/finance';
import Finance from 'components/finance';
import { GetServerSideProps } from 'next';
import { fetchTransactionsHelper } from './api/finance/fetch';

interface Props {
	initialData: UpApiReturn | null;
}

export default function FinancesPage({ initialData }: Props): ReactElement {
	const [password, setPassword] = useState('');
	const [data, setData] = useState<UpApiReturn | null>(initialData);
	const [loading, setLoading] = useState(false);

	const handleLogin = async () => {
		if (!password) return;
		setLoading(true);
		try {
			const res = await fetch('/api/finance/fetch', {
				headers: new Headers({ api_key: password }),
				credentials: 'include',
			});
			if (res.ok) {
				setData(await res.json());
			}
		} catch (e) {
			console.error(e);
		}
		setLoading(false);
	};

	return (
		<>
			<NextSeo noindex={true} nofollow={true} />
			<div className="display-width">
				<h2 className="mb-4 text-3xl">Our Finances</h2>
			</div>
			<div className="display-width divider-before">
				{loading ? (
					<p>Loading</p>
				) : data ? (
					<Finance data={data} />
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
	const initialData = await fetchTransactionsHelper(context.req, context.res);

	const props: Props = {
		initialData,
	};

	return {
		props,
	};
};

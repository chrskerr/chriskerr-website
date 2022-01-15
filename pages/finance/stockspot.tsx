import { ReactElement, useState } from 'react';
import { NextSeo } from 'next-seo';

import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { confirmCookieAuth } from 'components/finance/helpers';

export default function FinancesPage(): ReactElement {
	const [balance, setBalance] = useState<number>(0);
	const router = useRouter();

	const handleClick = async () => {
		await fetch('/api/finance/stockspot', {
			method: 'POST',
			body: JSON.stringify({ balance }),
			headers: { 'Content-Type': 'Application/json' },
			credentials: 'include',
		});
		router.push('/finance');
	};

	return (
		<>
			<NextSeo noindex={true} nofollow={true} />
			<div className="display-width">
				<h2 className="text-3xl">Report Stockspot Balance</h2>
			</div>
			<div className="display-width divider-before">
				<input
					type="number"
					placeholder="Current Balance"
					value={balance}
					onChange={e => setBalance(Number(e.target.value))}
				/>
				<button className="ml-4 button" onClick={handleClick}>
					Save
				</button>
			</div>
		</>
	);
}

export const getServerSideProps: GetServerSideProps = async context => {
	const hasCookie = confirmCookieAuth(context.req, context.res);

	if (hasCookie) {
		return {
			props: {},
		};
	}

	return {
		redirect: {
			destination: '/finance',
			permanent: false,
		},
	};
};

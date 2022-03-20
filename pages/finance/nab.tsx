import { ReactElement, useState } from 'react';
import { NextSeo } from 'next-seo';

import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { confirmCookieAuth } from 'components/finance/helpers';
import { ReportNabBody } from 'types/finance';

export default function FinancesPage(): ReactElement {
	const [savingsDollars, setSavingsDollars] = useState<number>(0);
	const [loanDollars, setLoanDollars] = useState<number>(0);
	const router = useRouter();

	const handleClick = async () => {
		const body: ReportNabBody = {
			savingsDollars: Math.floor(savingsDollars),
			loanDollars: Math.floor(loanDollars),
		};
		await fetch('/api/finance/stockspot', {
			method: 'POST',
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'Application/json' },
			credentials: 'include',
		});
		router.push('/finance');
	};

	return (
		<>
			<NextSeo noindex={true} nofollow={true} />
			<div className="display-width">
				<h2 className="text-3xl">Report NAB Balances</h2>
			</div>
			<div className="grid grid-cols-2 gap-4 display-width divider-before justify-items-start">
				<label>Current NAB Savings balance (whole $)</label>
				<input
					type="number"
					placeholder="Current NAB Savings balance (whole $)"
					value={savingsDollars}
					onChange={e => setSavingsDollars(Number(e.target.value))}
				/>

				<label>Current Mortgage balance (whole $)</label>
				<input
					type="number"
					placeholder="Current Mortgage balance (whole $)"
					value={savingsDollars}
					onChange={e =>
						setLoanDollars(
							Number(e.target.value) > 0
								? 0
								: Number(e.target.value),
						)
					}
				/>

				<button className="button" onClick={handleClick}>
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

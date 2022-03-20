import { ReactElement, useEffect, useState } from 'react';
import { NextSeo } from 'next-seo';
import Link from 'next/link';

import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { confirmCookieAuth } from 'components/finance/helpers';
import { ReportNabBody } from 'types/finance';
import { socketServerUrl } from 'lib/constants';

export default function FinancesPage(): ReactElement {
	const [savingsDollars, setSavingsDollars] = useState<string | undefined>();
	const [loanDollars, setLoanDollars] = useState<string | undefined>();

	const [error, setError] = useState<string | undefined>();
	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();

	const handleClick = async () => {
		if (!savingsDollars || !loanDollars || isLoading) return;

		try {
			setIsLoading(true);

			const body: ReportNabBody = {
				savingsDollars: Math.floor(Number(savingsDollars)),
				loanDollars: Math.floor(Number(loanDollars)),
			};
			await fetch('/api/finance/nab', {
				method: 'POST',
				body: JSON.stringify(body),
				headers: { 'Content-Type': 'Application/json' },
				credentials: 'include',
			});

			setIsLoading(false);

			router.push('/finance');
		} catch {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (!savingsDollars && !loanDollars) {
			setError(undefined);
		}

		if (!savingsDollars || isNaN(Number(savingsDollars))) {
			setError('Please complete savings balance');
			return;
		}
		if (
			!loanDollars ||
			isNaN(Number(loanDollars)) ||
			Number(loanDollars) > 0
		) {
			setError('Loan balance must be less than 0');
			return;
		}

		setError(undefined);
	}, [savingsDollars, loanDollars]);

	useEffect(() => {
		void fetch(socketServerUrl);
	}, []);

	return (
		<>
			<NextSeo noindex={true} nofollow={true} />
			<div className="display-width">
				<h2 className="text-3xl">Report NAB Balances</h2>
				<Link href="/finance" passHref>
					<a className="hover:underline text-brand">
						Back to Finances
					</a>
				</Link>
			</div>
			<div className="grid grid-cols-2 gap-4 display-width divider-before justify-items-start">
				<label>Current NAB Savings balance (whole $)</label>
				<input
					type="number"
					placeholder="Current NAB Savings balance (whole $)"
					value={savingsDollars}
					onChange={e => setSavingsDollars(e.target.value)}
				/>

				<label>Current Mortgage balance (whole $)</label>
				<input
					type="number"
					className="invalid:ring-red-500 invalid:border-red-500"
					placeholder="Current Mortgage balance (whole $)"
					value={loanDollars}
					max={0}
					onChange={e => setLoanDollars(e.target.value)}
				/>

				{error && (
					<p className="col-span-2 font-bold text-red-500">{error}</p>
				)}

				<button
					className="button"
					onClick={handleClick}
					disabled={
						isLoading || !!error || !savingsDollars || !loanDollars
					}
				>
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

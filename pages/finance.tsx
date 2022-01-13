import { ReactElement, useState } from 'react';
import { NextSeo } from 'next-seo';

import { UpApiReturn } from 'types/finance';
import { socketServerUrl } from 'lib/constants';
import Finance from 'components/finance';

export default function FinancesPage(): ReactElement {
	const [password, setPassword] = useState('');
	const [data, setData] = useState<UpApiReturn>();
	const [loading, setLoading] = useState(false);

	const handleLogin = async () => {
		if (!password) return;
		setLoading(true);
		try {
			const res = await fetch(socketServerUrl + '/up/week', {
				headers: new Headers({ api_key: password }),
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

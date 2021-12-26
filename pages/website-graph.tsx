import type { ReactElement } from 'react';
import { NextSeo } from 'next-seo';
import WebsiteGrapher from 'components/website-graph';

const title = 'Website Connection Graph Visualiser';

export default function WebsiteGraph(): ReactElement {
	return (
		<>
			<NextSeo
				title={title}
				description="Visualise outbound connections from a particular website"
				canonical="https://www.chriskerr.com.au/website-graph"
			/>
			<div className="display-width">
				<h2 className="mb-4 text-3xl">{title}</h2>
				<p className="mb-4">
					I wanted an excuse to start building a webscaper and then
					got carried away working out node placement algorithms...
					this is v1!
				</p>
				<p className="mb-4">
					Enter a URL and it will grab connections out to a distance
					of 4. To limited runtime, only the first 5 urls found on
					each page are crawled.
				</p>
			</div>
			<WebsiteGrapher />
		</>
	);
}

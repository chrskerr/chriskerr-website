import { ReactElement } from 'react';
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
					I wanted an excuse to start building a webscaper... so here
					is the start!
				</p>
			</div>
			<WebsiteGrapher />
		</>
	);
}


import QuickAndDead from "components/quick-and-dead";
import { decode } from "components/quick-and-dead/helpers";
import { useRouter } from "next/router";
import { ReactElement } from "react";

export default function QuickAndDeadIndex (): ReactElement {
	const { query } = useRouter();

	const data = decode( query.id );

	const day = ( data && !Array.isArray( data )) ? data : undefined;
	const week = Array.isArray( data ) ? data : undefined;

	return (
		<QuickAndDead urlDay={ day } urlWeek={ week } />
	);
}
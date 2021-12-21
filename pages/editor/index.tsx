
import { GetStaticProps } from "next";

export default function EditorRoute () {
	return (
		<div />
	);
}

export const getStaticProps: GetStaticProps = () => {
	return {
		redirect: {
			permanent: true,
			destination: "/editor/new",
		},
	};
};
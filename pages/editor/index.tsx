
import { GetServerSideProps } from "next";

export default function EditorRoute () {
	return (
		<div />
	);
}

export const getServerSideProps: GetServerSideProps = async () => {
	return {
		redirect: {
			permanent: true,
			destination: "/editor/new",
		},
	};
};
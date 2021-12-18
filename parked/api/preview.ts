
import { getAllBlogs } from "parked/fetch-data";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async ( req, res ) => {
	const { token: ref, documentId } = req.query;

	const previewData = await getAllBlogs( undefined, Array.isArray( ref ) ? ref[ 0 ] : ref );
	const previewDoc = previewData?.find(({ id }) => id === documentId );

	const redirectUrl = previewDoc ? `/${ previewDoc.slug }` : undefined;

	if ( !redirectUrl ) return res.status( 500 ).send( "Invalid Request" );

	res.setPreviewData({ ref }, { maxAge: 60 * 30 });
	return res.redirect( redirectUrl ).end();
};

export default handler;

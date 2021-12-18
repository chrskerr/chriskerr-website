
import { NextApiHandler } from "next";

const handler: NextApiHandler = async ( req, res ) => {
	return res.clearPreviewData().end();
};

export default handler;

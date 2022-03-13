import { confirmCookieAuth } from 'components/finance/helpers';
import { firestore } from 'lib/firebase-admin';
import { collectionName, IData } from 'lib/kate';
import { NextApiHandler } from 'next';
import NextCors from 'nextjs-cors';

export interface IKateSaveBody {
	data: IData;
}

const handler: NextApiHandler = async (req, res) => {
	await NextCors(req, res, {
		origin: process.env.NEXT_PUBLIC_URL_BASE,
		methods: ['POST'],
	});

	const data = req.body.data;

	const isAuthed = confirmCookieAuth(req, res);
	if (!isAuthed || !data?.id) {
		return res.status(401).end();
	}

	const docs = await firestore
		.collection(collectionName)
		.where('id', '==', data.id)
		.get();

	if (!docs.docs?.[0]) {
		return res.status(500).end();
	}

	await firestore.collection(collectionName).doc(docs.docs?.[0].id).set(data);

	res.status(200).end();
};

export default handler;

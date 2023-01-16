import { allWorkouts } from 'lib/workouts';
import sample from 'lodash/sample';
import { NextApiHandler } from 'next';

const ids = allWorkouts.map(({ id }) => id);

const handler: NextApiHandler = async (req, res) => {
	const randomId = sample(ids);
	res.status(307).redirect(`/workout/${randomId}`);
};

export default handler;

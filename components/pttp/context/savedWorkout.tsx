import { ReactNode, createContext, useEffect, useState } from 'react';

type WorkoutContext = {
	temporary: {
		savedAt: string;
		data: Record<string, string>;
	};
	permanent: Record<string, string>;
};
type WithHelpers = {
	update: (data: WorkoutContext) => void;
	data: WorkoutContext;
};

const fallback: WorkoutContext = {
	temporary: {
		savedAt: new Date().toDateString(),
		data: {},
	},
	permanent: {},
};

export const SavedWorkoutContext = createContext<WithHelpers>({
	data: { ...fallback },
	update: () => {
		/**/
	},
});

type Props = {
	savedWorkout: WorkoutContext;
	children: ReactNode;
};

export function SavedWorkoutContextProvider({ savedWorkout, children }: Props) {
	const [state, setState] = useState<WithHelpers>({
		data: savedWorkout,
		update: (data: WorkoutContext) => setState(s => ({ ...s, data })),
	});

	useEffect(() => {
		// publish the data to the server when saved
		// debounce
	}, [state.data]);

	return (
		<SavedWorkoutContext.Provider value={state}>
			{children}
		</SavedWorkoutContext.Provider>
	);
}

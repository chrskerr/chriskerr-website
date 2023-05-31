import { ReactNode, createContext, useState } from 'react';

export const DisableClickConstraintContext = createContext<boolean>(false);

type Props = {
	children: ReactNode;
};

function invert(input: boolean): boolean {
	return !input;
}

export function DisableClickConstraintContextProvider({ children }: Props) {
	const [state, setState] = useState<boolean>(false);

	return (
		<DisableClickConstraintContext.Provider value={state}>
			{children}
			<div className="display-width divider-before">
				<label>
					Disable the single click constraint?{' '}
					<input
						type="checkbox"
						checked={state}
						onChange={() => setState(invert)}
					/>
				</label>
			</div>
		</DisableClickConstraintContext.Provider>
	);
}


import { useEffect, useRef } from "react";
import type { EditableCanvasProps } from "types";
import useEditableCanvas from "components/editable-canvas/use-editable-canvas";

export default function EditableCanvas ({ cachedData, onChange, setMarkdown, sessionId, receivedChanges }: EditableCanvasProps ) {
	const $_ref = useRef<HTMLCanvasElement>( null );
	const { markdown, height, hasFocus } = useEditableCanvas({ ref: $_ref, cachedData, onChange, sessionId, receivedChanges });

	useEffect(() => {
		setMarkdown( markdown );
	}, [ markdown ]);

	const classes = `
		p-8 border-2 mt-2 w-full
		${ hasFocus ? "border-brand" : "" }
	`;

	return (
		<div className={ classes }>
			<canvas ref={ $_ref } height={ height } width="auto" className="outline-none" />
		</div>
	);
}

import { parseProgram } from "../lang/parser";
import {
	createCanvas,
	createIDEInterpreter,
	createTurtle,
} from "./elements/create-interpreter";
import { deserializeProgram, SerializedProgram } from "./program-serializer";

export type StandaloneData = {
	code: SerializedProgram;
	mode: "canvas" | "turtle";
};

export async function showStandalonePage(
	container: HTMLElement,
	data: StandaloneData
) {
	const mainFile = deserializeProgram(data.code);
	const { program } = await parseProgram(mainFile);
	if (program == null) return; // This has been validated on export

	const interpreter = createIDEInterpreter(program);

	switch (data.mode) {
		case "canvas": {
			const canvas = createCanvas(interpreter, container);
			interpreter.service.canvas.dom = canvas;
			container.replaceChildren(canvas);

			// allow keyboard input
			container.tabIndex = -1;
			container.focus();
			break;
		}
		case "turtle": {
			const turtle = createTurtle(container);
			container.style.alignContent = "center";
			container.style.textAlign = "center";
			interpreter.service.turtle.dom = turtle;
			container.replaceChildren(turtle);
			break;
		}
	}

	interpreter.run();
}

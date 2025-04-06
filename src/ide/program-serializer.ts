import { ParseInput } from "../lang/parser";

export interface SerializedFile {
	filename: string;
	source: string;
	/** A mapping from file name (as in the include statement) to file id */
	includes: Record<string, string>;
}

export interface SerializedProgram {
	main: string;
	/** Included files, indexed by their id */
	files: Record<string, SerializedFile>;
}

/**
 * Bundles all included files into a {@link SerializedProgram}
 *
 * The {@link SerializedProgram} in the returned tuple is initially empty.
 * While the returned {@link ParseInput} is parsed,
 * all includes are recorded and bundled.
 *
 * @example
 * const entryInput = …;
 * const [recorder, serializedProgram] = createProgramSerializer(entryInput);
 * // serializedProgram is still empty
 *
 * // parse and serialize the program
 * const { program, errors } = parseProgram(recorder);
 *
 * // serializedProgram can now be used
 *
 * @param mainInput the program entry
 */
export function createProgramSerializer(
	mainInput: ParseInput
): [ParseInput, SerializedProgram] {
	const program = {
		main: mainInput.id,
		files: {},
	};
	function createFile(input: ParseInput): ParseInput {
		const file: SerializedFile = {
			filename: input.filename,
			source: input.source,
			includes: {},
		};
		program.files[input.id] = file;
		return {
			id: input.id,
			filename: input.filename,
			source: input.source,
			async resolveInclude(filename) {
				const result = await input.resolveInclude(filename);
				if (!result) return null;

				file.includes[filename] = result.id;
				return (program.files[result.id] ??= createFile(input));
			},
		};
	}
	return [createFile(mainInput), program];
}

export function deserializeProgram(data: SerializedProgram): ParseInput {
	const deserializedFiles: Record<string, ParseInput> = {};
	function createInput(id: string, file: SerializedFile): ParseInput {
		return {
			id,
			filename: file.filename,
			source: file.source,
			resolveInclude: async (filename) =>
				Object.hasOwn(file.includes, filename)
					? getInput(file.includes[filename])
					: null,
		};
	}
	const getInput = (id: string): ParseInput =>
		(deserializedFiles[id] ??= createInput(id, data.files[id]));
	return getInput(data.main);
}

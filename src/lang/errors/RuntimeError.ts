// exception type
export class RuntimeError extends Error {

	public constructor(
		msg: string,
		public fileId?: string,
		public filename?: string,
		public line?: number,
		public ch?: number,
		public href?: string
	) {
		super(msg);
		this.name = "Runtime Error";
	}
}

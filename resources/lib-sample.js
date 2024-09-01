export class DirectoryListHandler {
	constructor(directories) {
		this.directories = directories;
	}
	addDirectory(directory) {
		this.directories.push(directory);
	}
	removeDirectory(directory) {
		this.directories = this.directories.filter(d => d !== directory);
	}
	reset() {
		this.directories = [];
		return this;
	}
}

export function instantiate(directories) {
	return new DirectoryListHandler(directories);
}

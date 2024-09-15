export class DirectoryListHandler {
	constructor(directories) {
		this.directories = [];
		for (let i = 0; i < directories.length; i++) {
			this.addDirectory(directories[i]);
		}
	}
	/**
	 * Add a directory to the list
	 * @param {string} directory
	 * @returns {boolean} True if the directory was added, false if it already exists
	 */
	addDirectory(directory) {
		// Check if the directory already exists
		function findCallback(d) {
			// Return true if the directory already exists
			return d === directory;
		}
		const found = this.directories.find(findCallback);
		if (found) {
			// Directory already exists
			console.log(`Directory ${directory} already exists.`);
			return false;
		}
		// Add the directory to the list
		this.directories.push(directory);
		return true;
	}
	/**
	 * Remove a directory from the list
	 * @param {string} directory 
	 */
	removeDirectory(directory) {
		// Remove the directory from the list
		const filterCallback = function(d) {
			// Return all directories that are not the one we want to remove
			return d !== directory;
		}
		this.directories = this.directories.filter(filterCallback);
	}
	/**
	 * Reset the directory list
	 * @returns {DirectoryListHandler}
	 */
	reset() {
		this.directories = [];
		return this;
	}
}

export function instantiate(directories) {
	return new DirectoryListHandler(directories);
}

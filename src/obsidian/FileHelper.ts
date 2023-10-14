import { App, TAbstractFile, TFile } from 'obsidian';

export class FileHelper {
	readonly app: App;

	constructor(app: App) {
		this.app = app;
	}

	async createFolderIfNotExists(folder: string): Promise<void> {
		const folderExists = await this.app.vault.adapter.exists(folder);
		if (!folderExists) {
			await this.app.vault.createFolder(folder);
		}
	}

	async getAbstractFileByPath(path: string): Promise<TAbstractFile | null> {
		return this.app.vault.getAbstractFileByPath(path);
	}

	create(normalizedPath: string, body: string): Promise<TFile> {
		return this.app.vault.create(normalizedPath, body);
	}
}

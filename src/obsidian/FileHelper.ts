import { App, TAbstractFile, TFile } from 'obsidian';

type Processor = (oldContent: string) => string;

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

	async process(normalizedPath: TFile, processor: Processor): Promise<void> {
		await this.app.vault.process(normalizedPath, (oldContent: string) => {
			return processor(oldContent);
		});
	}
}

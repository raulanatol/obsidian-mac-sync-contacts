import { MacSyncContactsPluginSettings } from './SettingsTab';
import { App } from 'obsidian';
import { FileHelper } from './FileHelper';

export class Context {
	readonly settings: MacSyncContactsPluginSettings;
	readonly app: App;
	readonly fileHelper: FileHelper;

	constructor(settings: MacSyncContactsPluginSettings, app: App) {
		this.settings = settings;
		this.app = app;
		this.fileHelper = new FileHelper(app);
	}
}

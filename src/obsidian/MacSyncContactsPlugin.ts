import { Notice, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, MacSyncContactsPluginSettings, SettingsTab } from './SettingsTab';
import { SyncContactsAction } from '../actions/SyncContactsAction';
import { Context } from './Context';

export class MacSyncContactsPlugin extends Plugin {
	settings: MacSyncContactsPluginSettings;
	context: Context;

	async onload() {
		await this.loadSettings();

		this.context = new Context(this.settings, this.app);

		this.addRibbonIcon('contact', 'Sync mac contacts', (evt: MouseEvent) => {
			new SyncContactsAction(this.context).execute().then((contacts) => {
				new Notice(`Sync ${contacts.length} contacts`);
			});
		}).addClass('sync-mac-contacts-ribbon-class');

		this.addSettingTab(new SettingsTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

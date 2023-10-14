import { App, PluginSettingTab, Setting } from 'obsidian';
import MacSyncContactsPlugin from '../../main';
import { FolderSuggest } from './suggest/FolderSuggest';

export const DEFAULT_SETTINGS: MacSyncContactsPluginSettings = {
	contactsFolder: 'People'
}

export interface MacSyncContactsPluginSettings {
	contactsFolder: string;
}

export class SettingsTab extends PluginSettingTab {
	plugin: MacSyncContactsPlugin;

	constructor(app: App, plugin: MacSyncContactsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Contacts folder')
			.setDesc('Select the folder where your contacts are stored')
			.addSearch(search => {
				new FolderSuggest(search.inputEl);
				search.setPlaceholder('Contacts folder')
					.setValue(this.plugin.settings.contactsFolder)
					.onChange(async (value) => {
						this.plugin.settings.contactsFolder = value;
						await this.plugin.saveSettings();
					})
			});
	}
}

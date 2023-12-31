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

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('contact', 'Sync mac contacts', (evt: MouseEvent) => {
			new SyncContactsAction(this.context).execute().then(contacts => {
				new Notice(`Sync ${contacts.length} contacts`);
			});
		}).addClass('sync-mac-contacts-ribbon-class');

		// This adds a simple command that can be triggered anywhere
		// this.addCommand({
		// 	id: 'open-sample-modal-simple',
		// 	name: 'Open sample modal (simple)',
		// 	callback: () => {
		// 		new MacSyncContactsModal(this.app).open();
		// 	}
		// });
		// This adds an editor command that can perform some operation on the current editor instance
		// this.addCommand({
		// 	id: 'sample-editor-command',
		// 	name: 'Sample editor command',
		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 		console.log(editor.getSelection());
		// 		editor.replaceSelection('Sample Editor Command');
		// 	}
		// });
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: 'open-sample-modal-complex',
		// 	name: 'Open sample modal (complex)',
		// 	checkCallback: (checking: boolean) => {
		// 		Conditions to check
		// const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// if (markdownView) {
		// 	If checking is true, we're simply "checking" if the command can be run.
		// 	If checking is false, then we want to actually perform the operation.
		// if (!checking) {
		// 	new MacSyncContactsModal(this.app).open();
		// }
		//
		// This command will only show up in Command Palette when the check function returns true
		// return true;
		// }
		// }
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingsTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

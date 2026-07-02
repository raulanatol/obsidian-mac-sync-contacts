import { Notice, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, MacSyncContactsPluginSettings, SettingsTab } from './SettingsTab';
import { SyncContactsAction } from '../actions/SyncContactsAction';
import { SyncContactToMacAction } from '../actions/SyncContactToMacAction';
import { SyncContactFromMacAction } from '../actions/SyncContactFromMacAction';
import { Context } from './Context';

export class MacSyncContactsPlugin extends Plugin {
  settings: MacSyncContactsPluginSettings;
  context: Context;

  async onload() {
    await this.loadSettings();

    this.context = new Context(this.settings, this.app);

    this.addRibbonIcon('contact', 'Sync mac contacts', (evt: MouseEvent) => {
      new SyncContactsAction(this.context).execute().then(stats => {
        new Notice(
          `Synced ${stats.total} contacts (${stats.created} new, ${stats.updated} updated, ${stats.failed} failed)`
        );
      });
    }).addClass('sync-mac-contacts-ribbon-class');

    this.addCommand({
      id: 'sync-active-contact-to-mac',
      name: 'Sync active contact to Mac Contacts',
      checkCallback: (checking: boolean) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== 'md') {
          return false;
        }
        if (checking) {
          return true;
        }
        new SyncContactToMacAction(this.context, file)
          .execute()
          .then(({ created }) => {
            new Notice(created ? 'Contact created in Mac Contacts' : 'Contact updated in Mac Contacts');
          })
          .catch((err: Error) => {
            new Notice(`Sync to Mac Contacts failed: ${err.message}`);
          });
        return true;
      }
    });

    this.addCommand({
      id: 'sync-active-contact-from-mac',
      name: 'Sync active contact from Mac Contacts',
      checkCallback: (checking: boolean) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== 'md') {
          return false;
        }
        if (checking) {
          return true;
        }
        new SyncContactFromMacAction(this.context, file)
          .execute()
          .then((result) => {
            new Notice(`Contact ${result.status}: ${result.name}`);
          })
          .catch((err: Error) => {
            new Notice(`Sync from Mac Contacts failed: ${err.message}`);
          });
        return true;
      }
    });

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

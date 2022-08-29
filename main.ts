import {
	App,
	Editor,
	MarkdownView,
	Plugin,
	PluginSettingTab,
	Setting,
	FileSystemAdapter,
} from "obsidian";
import * as path from "path";
import * as fs from "fs";

// Remember to rename these classes and interfaces!

interface MyGardenerSettings {
	GithubUrl: string;
	GithubKey: string;
	MigrationPath: string;
}

const DEFAULT_SETTINGS: MyGardenerSettings = {
	GithubUrl: "https://github.com/KrishKrosh/digital-garden",
	GithubKey: "",
	MigrationPath: "",
};

export default class MyGardener extends Plugin {
	settings: MyGardenerSettings;

	async onload() {
		await this.loadSettings();

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "move-and-publish",
			name: "Move and publish",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				//get current file and copy it to MigrationPath
				const activeFile = this.app.workspace.getActiveFile();

				// The last open file is closed, no currently open files
				if (!activeFile) {
					return;
				}

				const basePath =
					app.vault.adapter instanceof FileSystemAdapter
						? app.vault.adapter.getBasePath()
						: null;

				const relativePath = activeFile.path;

				const absolutePath = basePath
					? path.join(basePath, relativePath)
					: null;

				console.log(absolutePath);

				if (!absolutePath) {
					return;
				}

				//copy file to MigrationPath
				const newFilePath =
					this.settings.MigrationPath +
					"/" +
					activeFile.basename +
					".md";

				console.log(newFilePath);

				fs.copyFile(absolutePath, newFilePath, (err) => {
					if (err) throw err;
					console.log("File was copied to destination");
				});
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new GardenerSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class GardenerSettingTab extends PluginSettingTab {
	plugin: MyGardener;

	constructor(app: App, plugin: MyGardener) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Migration Settings" });

		new Setting(containerEl)
			.setName("Github Repo Link")
			.setDesc("https://github.com/KrishKrosh/digital-garden")
			.addText((text) =>
				text
					.setPlaceholder("Enter your URL")
					.setValue(this.plugin.settings.GithubUrl)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.GithubUrl = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Github Key")
			.setDesc("It's a secret!")
			.addText((text) =>
				text
					.setPlaceholder("Enter your Key")
					.setValue(this.plugin.settings.GithubKey)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.GithubKey = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Migration Path")
			.setDesc("Where to migrate your notes")
			.addText((text) =>
				text
					.setPlaceholder("Enter your Path")
					.setValue(this.plugin.settings.MigrationPath)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.MigrationPath = value;
						await this.plugin.saveSettings();
					})
			);
	}
}

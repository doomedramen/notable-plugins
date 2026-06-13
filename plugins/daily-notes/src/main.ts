import type { NotablePlugin } from "notable-plugin-api";

interface Settings {
  folder: string;
}

const DEFAULTS: Settings = { folder: "Daily" };

function localDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeFolder(value: string): string {
  return value
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\/{2,}/g, "/");
}

const plugin: NotablePlugin = {
  async onload(api) {
    const saved = (await api.settings.load<Partial<Settings>>()) ?? {};
    let settings: Settings = {
      folder:
        typeof saved.folder === "string" ? saved.folder : DEFAULTS.folder,
    };

    const openToday = async () => {
      try {
        const name = localDate();
        const folder = normalizeFolder(settings.folder);
        const path = folder ? `${folder}/${name}.md` : `${name}.md`;
        const notes = await api.vault.list();
        const existing = notes.find((note) => note.path === path);
        if (existing) {
          api.workspace.openNote(existing.path);
          return;
        }
        const created = await api.vault.create(name, folder);
        api.workspace.openNote(created.path);
      } catch (error) {
        console.error("[daily-notes] could not open today's note", error);
        api.ui.notice("Could not open today's daily note.");
      }
    };

    api.commands.register({
      id: "daily-notes.open-today",
      name: "Open today's daily note",
      hotkey: "Mod-Alt-D",
      run: () => void openToday(),
    });

    api.workspace.registerSettingsTab({
      id: "daily-notes",
      title: "Daily notes",
      mount(element) {
        const heading = document.createElement("h3");
        heading.textContent = "Daily notes";
        Object.assign(heading.style, {
          margin: "0",
          color: "var(--foreground)",
          fontSize: "13px",
          fontWeight: "600",
        });

        const description = document.createElement("p");
        description.textContent =
          "Choose the vault folder used for notes named YYYY-MM-DD.";
        Object.assign(description.style, {
          margin: "6px 0 14px",
          color: "var(--muted)",
          fontSize: "13px",
          lineHeight: "1.5",
        });

        const label = document.createElement("label");
        label.textContent = "Folder";
        Object.assign(label.style, {
          display: "block",
          color: "var(--foreground)",
          fontSize: "13px",
          fontWeight: "500",
        });

        const input = document.createElement("input");
        input.value = settings.folder;
        input.placeholder = "Daily";
        Object.assign(input.style, {
          display: "block",
          boxSizing: "border-box",
          width: "100%",
          height: "32px",
          marginTop: "6px",
          padding: "0 10px",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          outline: "none",
          background: "var(--background)",
          color: "var(--foreground)",
          font: "inherit",
          fontSize: "13px",
        });

        const save = document.createElement("button");
        save.textContent = "Save";
        Object.assign(save.style, {
          height: "32px",
          marginTop: "12px",
          padding: "0 12px",
          border: "0",
          borderRadius: "var(--radius-sm)",
          background: "var(--accent)",
          color: "var(--accent-foreground)",
          font: "inherit",
          fontSize: "13px",
          fontWeight: "600",
          cursor: "pointer",
        });
        save.addEventListener("click", () => {
          settings = { folder: normalizeFolder(input.value) };
          input.value = settings.folder;
          void api.settings
            .save(settings)
            .then(() => {
              api.ui.notice("Daily notes settings saved.");
            })
            .catch((error) => {
              console.error("[daily-notes] could not save settings", error);
              api.ui.notice("Could not save Daily Notes settings.");
            });
        });

        label.appendChild(input);
        element.append(heading, description, label, save);
        return () => {
          element.textContent = "";
        };
      },
    });
  },
};

export default plugin;

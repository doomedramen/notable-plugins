import type { NotablePlugin } from "notable-plugin-api";

interface Settings {
  path: string;
  openOnStartup: boolean;
}

const DEFAULTS: Settings = {
  path: "",
  openOnStartup: false,
};

let startupTimer: number | null = null;

function style<T extends HTMLElement>(element: T, rules: Partial<CSSStyleDeclaration>): T {
  Object.assign(element.style, rules);
  return element;
}

const plugin: NotablePlugin = {
  async onload(api) {
    const saved = (await api.settings.load<Partial<Settings>>()) ?? {};
    let settings: Settings = {
      path: typeof saved.path === "string" ? saved.path : DEFAULTS.path,
      openOnStartup:
        typeof saved.openOnStartup === "boolean"
          ? saved.openOnStartup
          : DEFAULTS.openOnStartup,
    };

    const openHomepage = async (showNotice = true) => {
      if (!settings.path) {
        if (showNotice) api.ui.notice("Choose a homepage in plugin settings.");
        return;
      }

      try {
        const notes = await api.vault.list();
        const homepage = notes.find((note) => note.path === settings.path);
        if (!homepage) {
          if (showNotice) {
            api.ui.notice("The configured homepage no longer exists.");
          }
          return;
        }
        api.workspace.openNote(homepage.path);
      } catch (error) {
        console.error("[homepage] could not open homepage", error);
        if (showNotice) api.ui.notice("Could not open the homepage.");
      }
    };

    api.commands.register({
      id: "homepage.open",
      name: "Open homepage",
      hotkey: "Mod-Alt-H",
      run: () => void openHomepage(),
    });

    api.workspace.registerSettingsTab({
      id: "homepage",
      title: "Homepage",
      mount(element) {
        let disposed = false;
        const heading = style(document.createElement("h3"), {
          margin: "0",
          color: "var(--foreground)",
          fontSize: "13px",
          fontWeight: "600",
        });
        heading.textContent = "Homepage";

        const description = style(document.createElement("p"), {
          margin: "6px 0 14px",
          color: "var(--muted)",
          fontSize: "13px",
          lineHeight: "1.5",
        });
        description.textContent =
          "Choose a note to use as the vault homepage.";

        const label = style(document.createElement("label"), {
          display: "block",
          color: "var(--foreground)",
          fontSize: "13px",
          fontWeight: "500",
        });
        label.textContent = "Homepage note";

        const select = style(document.createElement("select"), {
          display: "block",
          boxSizing: "border-box",
          width: "100%",
          height: "34px",
          marginTop: "6px",
          padding: "0 8px",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          background: "var(--background)",
          color: "var(--foreground)",
          font: "inherit",
          fontSize: "13px",
        });
        const loading = document.createElement("option");
        loading.value = settings.path;
        loading.textContent = settings.path || "Loading notes...";
        select.appendChild(loading);
        label.appendChild(select);

        const startupLabel = style(document.createElement("label"), {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "14px",
          color: "var(--foreground)",
          fontSize: "13px",
          cursor: "pointer",
        });
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = settings.openOnStartup;
        startupLabel.append(checkbox, "Open on startup");

        const save = style(document.createElement("button"), {
          height: "32px",
          marginTop: "14px",
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
        save.textContent = "Save";
        save.addEventListener("click", () => {
          settings = {
            path: select.value,
            openOnStartup: checkbox.checked,
          };
          void api.settings
            .save(settings)
            .then(() => api.ui.notice("Homepage settings saved."))
            .catch((error) => {
              console.error("[homepage] could not save settings", error);
              api.ui.notice("Could not save Homepage settings.");
            });
        });

        element.append(heading, description, label, startupLabel, save);

        void api.vault
          .list()
          .then((notes) => {
            if (disposed) return;
            select.textContent = "";
            const none = document.createElement("option");
            none.value = "";
            none.textContent = "None";
            select.appendChild(none);
            for (const note of notes.sort((a, b) =>
              a.path.localeCompare(b.path),
            )) {
              const option = document.createElement("option");
              option.value = note.path;
              option.textContent = note.path;
              option.selected = note.path === settings.path;
              select.appendChild(option);
            }
          })
          .catch((error) => {
            console.error("[homepage] could not list notes", error);
            if (!disposed) loading.textContent = "Could not load notes";
          });

        return () => {
          disposed = true;
          element.textContent = "";
        };
      },
    });

    if (settings.openOnStartup && settings.path) {
      startupTimer = window.setTimeout(() => {
        startupTimer = null;
        if (api.vault.activeNoteId() === null) void openHomepage(false);
      }, 500);
    }
  },

  onunload() {
    if (startupTimer !== null) {
      window.clearTimeout(startupTimer);
      startupTimer = null;
    }
  },
};

export default plugin;

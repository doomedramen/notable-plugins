import type { NotableAPI, NotablePlugin } from "notable-plugin-api";

interface Template {
  id: string;
  name: string;
  content: string;
}

const DEFAULT_TEMPLATE: Template = {
  id: "meeting-note",
  name: "Meeting note",
  content: "# {{title}}\n\nDate: {{date}}\n\n## Notes\n\n{{selection}}",
};

function style<T extends HTMLElement>(element: T, rules: Partial<CSSStyleDeclaration>): T {
  Object.assign(element.style, rules);
  return element;
}

function makeId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `template-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

function noteTitle(path: string | null): string {
  const filename = path?.split("/").pop() ?? "";
  return filename.replace(/\.md$/i, "");
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

interface TemplateVariables {
  date: string;
  time: string;
  datetime: string;
  title: string;
  selection: string;
}

function variables(api: NotableAPI, selection: string): TemplateVariables {
  const now = new Date();
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return {
    date,
    time,
    datetime: `${date} ${time}`,
    title: noteTitle(api.vault.activeNoteId()),
    selection,
  };
}

function expand(content: string, values: TemplateVariables): string {
  return content.replace(
    /\{\{\s*(date|time|datetime|title|selection)\s*\}\}/gi,
    (_, name: string) => values[name.toLowerCase() as keyof TemplateVariables],
  );
}

function insertTemplate(api: NotableAPI, template: Template): void {
  const editor = api.editor.activeView();
  if (!editor) {
    api.ui.notice("Open a note before inserting a template.");
    return;
  }

  const selection = editor.state.selection.main;
  const selectedText = editor.state.doc.sliceString(
    selection.from,
    selection.to,
  );
  const content = expand(template.content, variables(api, selectedText));
  editor.dispatch({
    changes: { from: selection.from, to: selection.to, insert: content },
    selection: { anchor: selection.from + content.length },
    scrollIntoView: true,
  });
  editor.focus();
}

function normalizeTemplates(value: unknown): Template[] {
  if (!Array.isArray(value)) return [{ ...DEFAULT_TEMPLATE }];
  const templates = value
    .filter(
      (template): template is Partial<Template> =>
        !!template &&
        typeof template === "object" &&
        typeof (template as Partial<Template>).name === "string" &&
        typeof (template as Partial<Template>).content === "string",
    )
    .map((template) => ({
      id: typeof template.id === "string" ? template.id : makeId(),
      name: template.name as string,
      content: template.content as string,
    }));
  return templates.length > 0 ? templates : [{ ...DEFAULT_TEMPLATE }];
}

const plugin: NotablePlugin = {
  async onload(api) {
    const saved = (await api.settings.load<{ templates?: unknown }>()) ?? {};
    let templates = normalizeTemplates(saved.templates);
    let panel: HTMLElement | null = null;

    const renderPanel = () => {
      if (!panel) return;
      panel.textContent = "";

      const list = style(document.createElement("div"), {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        padding: "8px",
      });
      for (const template of templates) {
        const button = style(document.createElement("button"), {
          width: "100%",
          padding: "8px 10px",
          border: "1px solid transparent",
          borderRadius: "var(--radius-sm)",
          background: "transparent",
          color: "var(--foreground)",
          font: "inherit",
          fontSize: "13px",
          fontWeight: "500",
          textAlign: "left",
          cursor: "pointer",
        });
        button.textContent = template.name || "Untitled template";
        button.title = "Insert template";
        button.addEventListener("mouseenter", () => {
          button.style.background = "var(--surface-hover)";
        });
        button.addEventListener("mouseleave", () => {
          button.style.background = "transparent";
        });
        button.addEventListener("click", () => insertTemplate(api, template));
        list.appendChild(button);
      }
      panel.appendChild(list);
    };

    api.workspace.registerRightPanel({
      id: "templates",
      title: "Templates",
      mount(element) {
        panel = element;
        renderPanel();
        return () => {
          if (panel === element) panel = null;
          element.textContent = "";
        };
      },
    });

    api.commands.register({
      id: "templates.toggle",
      name: "Toggle templates",
      hotkey: "Mod-Alt-M",
      run: () => api.workspace.toggleRightPanel("templates"),
    });

    api.commands.register({
      id: "templates.insert-default",
      name: "Insert default template",
      when: () => api.editor.activeView() !== null,
      run: () => insertTemplate(api, templates[0]),
    });

    api.workspace.registerSettingsTab({
      id: "templates",
      title: "Templates",
      mount(element) {
        let draft = templates.map((template) => ({ ...template }));

        const heading = style(document.createElement("h3"), {
          margin: "0",
          color: "var(--foreground)",
          fontSize: "13px",
          fontWeight: "600",
        });
        heading.textContent = "Templates";

        const description = style(document.createElement("p"), {
          margin: "6px 0 14px",
          color: "var(--muted)",
          fontSize: "13px",
          lineHeight: "1.5",
        });
        description.textContent =
          "Available variables: {{title}}, {{date}}, {{time}}, {{datetime}}, and {{selection}}.";

        const editor = document.createElement("div");

        const renderEditor = () => {
          editor.textContent = "";
          for (const template of draft) {
            const card = style(document.createElement("section"), {
              marginBottom: "12px",
              padding: "12px",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
            });

            const name = style(document.createElement("input"), {
              boxSizing: "border-box",
              width: "100%",
              height: "32px",
              padding: "0 10px",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              background: "var(--background)",
              color: "var(--foreground)",
              font: "inherit",
              fontSize: "13px",
            });
            name.value = template.name;
            name.placeholder = "Template name";
            name.addEventListener("input", () => {
              template.name = name.value;
            });

            const content = style(document.createElement("textarea"), {
              boxSizing: "border-box",
              width: "100%",
              minHeight: "120px",
              marginTop: "8px",
              padding: "8px 10px",
              resize: "vertical",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              background: "var(--background)",
              color: "var(--foreground)",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "12px",
              lineHeight: "1.5",
            });
            content.value = template.content;
            content.placeholder = "Template content";
            content.addEventListener("input", () => {
              template.content = content.value;
            });

            const remove = style(document.createElement("button"), {
              marginTop: "8px",
              padding: "0",
              border: "0",
              background: "transparent",
              color: "var(--danger, #dc2626)",
              font: "inherit",
              fontSize: "12px",
              cursor: "pointer",
            });
            remove.textContent = "Remove template";
            remove.addEventListener("click", () => {
              draft = draft.filter((candidate) => candidate.id !== template.id);
              renderEditor();
            });

            card.append(name, content, remove);
            editor.appendChild(card);
          }
        };

        const add = style(document.createElement("button"), {
          height: "32px",
          padding: "0 12px",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          background: "var(--surface)",
          color: "var(--foreground)",
          font: "inherit",
          fontSize: "13px",
          fontWeight: "500",
          cursor: "pointer",
        });
        add.textContent = "Add template";
        add.addEventListener("click", () => {
          draft.push({ id: makeId(), name: "New template", content: "" });
          renderEditor();
        });

        const save = style(document.createElement("button"), {
          height: "32px",
          marginLeft: "8px",
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
          const next = draft
            .map((template) => ({
              ...template,
              name: template.name.trim(),
            }))
            .filter((template) => template.name && template.content);
          if (next.length === 0) {
            api.ui.notice("Keep at least one named, non-empty template.");
            return;
          }
          templates = next;
          draft = templates.map((template) => ({ ...template }));
          void api.settings
            .save({ templates })
            .then(() => {
              renderPanel();
              renderEditor();
              api.ui.notice("Templates saved.");
            })
            .catch((error) => {
              console.error("[templates] could not save templates", error);
              api.ui.notice("Could not save templates.");
            });
        });

        renderEditor();
        element.append(heading, description, editor, add, save);
        return () => {
          element.textContent = "";
        };
      },
    });
  },
};

export default plugin;

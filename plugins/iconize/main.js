const EMOJI = {
  bookmark: { glyph: "🔖", keywords: ["save", "mark"] },
  book: { glyph: "📚", keywords: ["read", "library"] },
  calendar: { glyph: "📅", keywords: ["date", "daily"] },
  chart: { glyph: "📊", keywords: ["analytics", "report"] },
  check: { glyph: "✅", keywords: ["done", "complete"] },
  code: { glyph: "💻", keywords: ["development", "programming"] },
  idea: { glyph: "💡", keywords: ["light", "bulb"] },
  inbox: { glyph: "📥", keywords: ["capture", "incoming"] },
  journal: { glyph: "📔", keywords: ["diary", "daily"] },
  link: { glyph: "🔗", keywords: ["url", "reference"] },
  meeting: { glyph: "🤝", keywords: ["people", "work"] },
  note: { glyph: "📝", keywords: ["write", "memo"] },
  pin: { glyph: "📌", keywords: ["important", "location"] },
  project: { glyph: "🗂️", keywords: ["folder", "work"] },
  research: { glyph: "🔬", keywords: ["science", "study"] },
  rocket: { glyph: "🚀", keywords: ["launch", "goal"] },
  star: { glyph: "⭐", keywords: ["favorite", "important"] },
  target: { glyph: "🎯", keywords: ["goal", "focus"] },
  task: { glyph: "☑️", keywords: ["todo", "checklist"] },
  warning: { glyph: "⚠️", keywords: ["alert", "important"] }
};

export default {
  onload(api) {
    api.icons.registerPack({
      id: "emoji",
      name: "Iconize emoji",
      icons: EMOJI
    });

    const choose = async (kind, path) => {
      const current = api.icons.getAssignment({ kind, path });
      const icon = await api.icons.pick({
        title: `Choose ${kind} icon`,
        current,
        allowClear: true
      });
      if (icon !== undefined) {
        await api.icons.setAssignment({ kind, path }, icon);
      }
    };

    api.commands.register({
      id: "iconize.active-note",
      name: "Iconize active note",
      icon: "icon",
      hotkey: "Mod-Alt-I",
      when: () => api.vault.activeNoteId() !== null,
      run: () => {
        const path = api.vault.activeNoteId();
        if (path) void choose("note", path);
      }
    });

    api.workspace.registerNoteContextMenu({
      id: "iconize.note",
      label: "Change icon…",
      icon: "icon",
      run: (path) => void choose("note", path)
    });
    api.workspace.registerNoteContextMenu({
      id: "iconize.note-clear",
      label: "Remove icon",
      icon: "clear",
      when: (path) => api.icons.getAssignment({ kind: "note", path }) !== null,
      run: (path) => void api.icons.setAssignment({ kind: "note", path }, null)
    });
    api.workspace.registerFolderContextMenu({
      id: "iconize.folder",
      label: "Change icon…",
      icon: "icon",
      run: (path) => void choose("folder", path)
    });
    api.workspace.registerFolderContextMenu({
      id: "iconize.folder-clear",
      label: "Remove icon",
      icon: "clear",
      when: (path) =>
        api.icons.getAssignment({ kind: "folder", path }) !== null,
      run: (path) =>
        void api.icons.setAssignment({ kind: "folder", path }, null)
    });
  }
};

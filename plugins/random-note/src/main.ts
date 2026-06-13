import type { NotablePlugin } from "notable-plugin-api";

const plugin: NotablePlugin = {
  onload(api) {
    api.commands.register({
      id: "random-note.open",
      name: "Open a random note",
      hotkey: "Mod-Alt-R",
      run: () => {
        void api.vault
          .list()
          .then((notes) => {
            if (notes.length === 0) {
              api.ui.notice("There are no notes to open.");
              return;
            }
            const active = api.vault.activeNoteId();
            const candidates =
              notes.length > 1
                ? notes.filter((note) => note.path !== active)
                : notes;
            const note =
              candidates[Math.floor(Math.random() * candidates.length)];
            if (note) api.workspace.openNote(note.path);
          })
          .catch((error) => {
            console.error("[random-note] could not list notes", error);
            api.ui.notice("Could not choose a random note.");
          });
      },
    });
  },
};

export default plugin;

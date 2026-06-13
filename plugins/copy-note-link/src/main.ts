import type { NotablePlugin } from "notable-plugin-api";

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through for browsers that expose the API but deny permission.
    }
  }

  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  if (!copied) throw new Error("copy command failed");
}

function noteName(path: string): string {
  const filename = path.split("/").pop() ?? path;
  return filename.replace(/\.md$/i, "");
}

const plugin: NotablePlugin = {
  onload(api) {
    api.commands.register({
      id: "copy-note-link.copy",
      name: "Copy link to active note",
      hotkey: "Mod-Shift-L",
      when: () => api.vault.activeNoteId() !== null,
      run: () => {
        const path = api.vault.activeNoteId();
        if (!path) return;
        const link = `[[${noteName(path)}]]`;
        void copyText(link)
          .then(() => api.ui.notice(`Copied ${link}`))
          .catch((error) => {
            console.error("[copy-note-link] could not copy link", error);
            api.ui.notice("Could not copy the note link.");
          });
      },
    });
  },
};

export default plugin;

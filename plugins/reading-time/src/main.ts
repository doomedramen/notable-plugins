import type { ViewUpdate } from "@codemirror/view";
import type { NotablePlugin } from "notable-plugin-api";

const WORDS_PER_MINUTE = 220;

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function readingTime(text: string): number {
  return Math.max(1, Math.ceil(countWords(text) / WORDS_PER_MINUTE));
}

const plugin: NotablePlugin = {
  onload(api) {
    const { view } = api.modules.codemirror;
    let label: HTMLElement | null = null;

    const render = (text: string) => {
      if (!label) return;
      const minutes = readingTime(text);
      label.textContent = `${minutes} min read`;
    };

    const renderActive = () => {
      const active = api.editor.activeView();
      render(active ? active.state.doc.toString() : "");
    };

    api.workspace.registerStatusBarItem({
      id: "reading-time",
      mount(element) {
        label = document.createElement("span");
        label.style.fontVariantNumeric = "tabular-nums";
        element.appendChild(label);
        renderActive();
        return () => {
          label = null;
          element.textContent = "";
        };
      },
    });

    api.editor.registerExtension(
      view.EditorView.updateListener.of((update: ViewUpdate) => {
        if (update.docChanged) render(update.state.doc.toString());
      }),
    );
    api.events.on("editor:ready", renderActive);
  },
};

export default plugin;

function pad(value) {
  return String(value).padStart(2, "0");
}

function dateText(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function timeText(now = new Date()) {
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function insert(api, text) {
  const editor = api.editor.activeView();
  if (!editor) {
    api.ui.notice("Open a note before inserting a date or time.");
    return;
  }
  const selection = editor.state.selection.main;
  editor.dispatch({
    changes: { from: selection.from, to: selection.to, insert: text },
    selection: { anchor: selection.from + text.length },
    scrollIntoView: true,
  });
  editor.focus();
}

export default {
  onload(api) {
    api.commands.register({
      id: "insert-date-time.date",
      name: "Insert current date",
      run: () => insert(api, dateText()),
    });
    api.commands.register({
      id: "insert-date-time.time",
      name: "Insert current time",
      run: () => insert(api, timeText()),
    });
    api.commands.register({
      id: "insert-date-time.timestamp",
      name: "Insert current date and time",
      hotkey: "Mod-Alt-T",
      run: () => {
        const now = new Date();
        insert(api, `${dateText(now)} ${timeText(now)}`);
      },
    });
  },
};

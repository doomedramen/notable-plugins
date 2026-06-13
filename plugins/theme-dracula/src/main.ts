import type { NotablePlugin } from "notable-plugin-api";

const plugin: NotablePlugin = {
  onload(api) {
    api.appearance.registerTheme({
      id: "dracula",
      name: "Dracula",
      stylesheet: "theme.css",
      controls: [
        {
          id: "preset",
          label: "Accent preset",
          type: "select",
          default: "purple",
          options: [
            {
              label: "Purple",
              value: "purple",
              variables: { "--accent-soft": "rgba(189, 147, 249, 0.16)" },
            },
            {
              label: "Pink",
              value: "pink",
              variables: { "--accent-soft": "rgba(255, 121, 198, 0.16)" },
            },
            {
              label: "Cyan",
              value: "cyan",
              variables: { "--accent-soft": "rgba(139, 233, 253, 0.16)" },
            },
          ],
        },
        {
          id: "density",
          label: "Interface density",
          type: "select",
          default: "1",
          cssVariable: "--theme-density",
          options: [
            { label: "Compact", value: "0.9" },
            { label: "Comfortable", value: "1" },
            { label: "Relaxed", value: "1.1" },
          ],
        },
        {
          id: "contrast",
          label: "Border contrast",
          type: "select",
          default: "#6272a4",
          cssVariable: "--border-strong",
          options: [
            { label: "Soft", value: "#44475a" },
            { label: "Normal", value: "#6272a4" },
            { label: "Strong", value: "#8be9fd" },
          ],
        },
        {
          id: "radius",
          label: "Corner radius",
          type: "number",
          cssVariable: "--radius",
          default: 8,
          min: 0,
          max: 18,
          step: 1,
          unit: "px",
        },
        {
          id: "accent",
          label: "Accent",
          type: "color",
          cssVariable: "--accent",
          default: "#bd93f9",
        },
      ],
    });
  },
};

export default plugin;

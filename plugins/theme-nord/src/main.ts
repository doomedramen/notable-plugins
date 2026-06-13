import type { NotablePlugin } from "notable-plugin-api";

const plugin: NotablePlugin = {
  onload(api) {
    api.appearance.registerTheme({
      id: "nord",
      name: "Nord",
      stylesheet: "theme.css",
      controls: [
        {
          id: "preset",
          label: "Palette preset",
          type: "select",
          default: "frost",
          options: [
            {
              label: "Frost",
              value: "frost",
              variables: {
                "--accent-soft": "rgba(136, 192, 208, 0.16)",
                "--selection": "rgba(136, 192, 208, 0.2)",
              },
            },
            {
              label: "Aurora",
              value: "aurora",
              variables: {
                "--accent-soft": "rgba(180, 142, 173, 0.16)",
                "--selection": "rgba(180, 142, 173, 0.2)",
              },
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
          default: "#4c566a",
          cssVariable: "--border-strong",
          options: [
            { label: "Soft", value: "#434c5e" },
            { label: "Normal", value: "#4c566a" },
            { label: "Strong", value: "#616e88" },
          ],
        },
        {
          id: "radius",
          label: "Corner radius",
          type: "number",
          cssVariable: "--radius",
          default: 8,
          min: 0,
          max: 16,
          step: 1,
          unit: "px",
        },
        {
          id: "accent",
          label: "Accent",
          type: "color",
          cssVariable: "--accent",
          default: "#88c0d0",
        },
      ],
    });
  },
};

export default plugin;

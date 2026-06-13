export default {
  onload(api) {
    api.appearance.registerTheme({
      id: "solarized",
      name: "Solarized",
      stylesheet: "theme.css",
      controls: [
        {
          id: "preset",
          label: "Accent preset",
          type: "select",
          default: "blue",
          options: [
            {
              label: "Blue",
              value: "blue",
              variables: { "--accent-soft": "rgba(38, 139, 210, 0.15)" }
            },
            {
              label: "Cyan",
              value: "cyan",
              variables: { "--accent-soft": "rgba(42, 161, 152, 0.15)" }
            },
            {
              label: "Orange",
              value: "orange",
              variables: { "--accent-soft": "rgba(203, 75, 22, 0.15)" }
            }
          ]
        },
        {
          id: "density",
          label: "Interface density",
          type: "select",
          default: "1",
          cssVariable: "--theme-density",
          options: [
            { "label": "Compact", "value": "0.9" },
            { "label": "Comfortable", "value": "1" },
            { "label": "Relaxed", "value": "1.1" }
          ]
        },
        {
          id: "contrast",
          label: "Border contrast",
          type: "select",
          default: "#93a1a1",
          cssVariable: "--border-strong",
          options: [
            { "label": "Soft", "value": "#eee8d5" },
            { "label": "Normal", "value": "#93a1a1" },
            { "label": "Strong", "value": "#657b83" }
          ]
        },
        {
          id: "radius",
          label: "Corner radius",
          type: "number",
          cssVariable: "--radius",
          default: 7,
          min: 0,
          max: 16,
          step: 1,
          unit: "px"
        },
        {
          id: "accent",
          label: "Accent",
          type: "color",
          cssVariable: "--accent",
          default: "#268bd2"
        }
      ]
    });
  }
};

import type { AppIconSlot, IconDefinition, IconRef, NotablePlugin } from "notable-plugin-api";

interface IconPack {
  icons: Record<string, IconDefinition>;
}

const plugin: NotablePlugin = {
  async onload(api) {
    const [pack, mapping] = await Promise.all([
      fetch(api.assets.url("pack.json")).then((response) => response.json() as Promise<IconPack>),
      fetch(api.assets.url("mapping.json")).then((response) => response.json() as Promise<Record<string, string>>),
    ]);
    api.icons.registerPack({
      id: "phosphor",
      name: "Phosphor",
      icons: pack.icons,
    });
    api.icons.registerTheme({
      id: "phosphor",
      name: "Phosphor",
      icons: Object.fromEntries(
        Object.entries(mapping).map(([slot, iconId]) => [
          slot,
          { packId: "phosphor", iconId } satisfies IconRef,
        ]),
      ) as Partial<Record<AppIconSlot, IconRef>>,
    });
  },
};

export default plugin;

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
      id: "tabler",
      name: "Tabler",
      icons: pack.icons,
    });
    api.icons.registerTheme({
      id: "tabler",
      name: "Tabler",
      icons: Object.fromEntries(
        Object.entries(mapping).map(([slot, iconId]) => [
          slot,
          { packId: "tabler", iconId } satisfies IconRef,
        ]),
      ) as Partial<Record<AppIconSlot, IconRef>>,
    });
  },
};

export default plugin;

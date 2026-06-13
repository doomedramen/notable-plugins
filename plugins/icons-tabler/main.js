export default {
  async onload(api) {
    const [pack, mapping] = await Promise.all([
      fetch(api.assets.url("pack.json")).then((response) => response.json()),
      fetch(api.assets.url("mapping.json")).then((response) => response.json())
    ]);
    api.icons.registerPack({
      id: "tabler",
      name: "Tabler",
      icons: pack.icons
    });
    api.icons.registerTheme({
      id: "tabler",
      name: "Tabler",
      icons: Object.fromEntries(
        Object.entries(mapping).map(([slot, iconId]) => [
          slot,
          { packId: "tabler", iconId }
        ])
      )
    });
  }
};

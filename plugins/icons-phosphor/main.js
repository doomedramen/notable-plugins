export default {
  async onload(api) {
    const [pack, mapping] = await Promise.all([
      fetch(api.assets.url("pack.json")).then((response) => response.json()),
      fetch(api.assets.url("mapping.json")).then((response) => response.json())
    ]);
    api.icons.registerPack({
      id: "phosphor",
      name: "Phosphor",
      icons: pack.icons
    });
    api.icons.registerTheme({
      id: "phosphor",
      name: "Phosphor",
      icons: Object.fromEntries(
        Object.entries(mapping).map(([slot, iconId]) => [
          slot,
          { packId: "phosphor", iconId }
        ])
      )
    });
  }
};

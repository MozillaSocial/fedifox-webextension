const port = browser.runtime.connect({
  name: "cs"
});

let active = false;
port.onMessage.addListener(a => {
  active = a;
  if (active) {
    const items = Microformats.get({
      filters: ['h-card']
    });
    if (Array.isArray(items.items) || Array.isArray(items?.rels?.me)) {
      const filteredItems = items.items.filter(item => item.properties?.url?.length);
      port.postMessage({
        hCards: filteredItems,
        relsme: items?.rels?.me || []
      });
    }
  }
});
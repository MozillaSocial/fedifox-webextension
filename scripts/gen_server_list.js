const fs = require('fs');

async function magic() {
  console.log("Step 1: Fetch the server list...");
  const servers = await fetch("https://nodes.fediverse.party/nodes.json").then(r => r.json());
  console.log(` - Found ${servers.length} servers`);

  console.log("Step 2: Filtering out the non-mastodon servers...");

  const instances = [];
  const total = servers.length;
  let count = 0;

  // Fetching the servers 1 by 1 takes hours. Let's run a few operations in
  // progress, via a "worker" function.
  const worker = async (servers) => {
    while (servers.length) {
      const server = servers.splice(0, 1);
      process.stdout.write(` - ${++count}/${total}\r`);
      if (await isMastodon(server[0])) {
        instances.push(server[0]);
      }
    }
  }

  const p = [];
  // 25 workers is a good number. If too high the requests start failing, if
  // too slow, the process will take longer.
  for (let i = 0; i < 25; ++i) {
    p.push(worker(servers));
  }

  await Promise.all(p);
  console.log(` - Found ${instances.length} mastodon instances`);

  console.log("Step 3: Saving the file...");
  fs.writeFileSync("servers.json", JSON.stringify(instances));
}

async function isMastodon(server) {
  try {
    const instance = await fetch(`https://${server}/api/v1/instance`).then(r => r.json());
    return instance.uri && instance.title && instance.version;
  } catch (e) {
    return false;
  }

}

magic();
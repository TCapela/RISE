/** @type {import('expo').Config} */
const fs = require("fs");
const path = require("path");

function readCommitHash() {
  try {
    const p = path.join(__dirname, "commit-hash.json");
    const raw = fs.readFileSync(p, "utf8");
    const json = JSON.parse(raw);
    return json.commitHash || "dev";
  } catch {
    return "dev";
  }
}

module.exports = {
  expo: {
    name: "RISE",
    slug: "rise-app",
    version: "1.0.0",
    extra: {
      apiBaseUrl: "http://192.168.15.4:5106/api/v1",
      commitHash: readCommitHash(),
    },
  },
};

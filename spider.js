const utilities = require("./utilities");
const request = utilities.promisify(require("request"));
const mkdirp = utilities.promisify(require("mkdirp"));
const fs = require("fs");

const readFile = utilities.promisify(fs.readFile);
const writeFile = utilities.promisify(fs.writeFile);

function spider(url, nesting) {
  let filename = utilities.urlToFilename(url);
  return readFile(filename, "utf8").then(
    (body) => spiderLinks(url, body, nesting),
    (err) => {
      if (err.code !== "ENOENT") {
        throw err;
      }

      return download(url, filename).then((body) =>
        spiderLinks(url, body, nesting)
      );
    }
  );
}

function download(url, filename, callback) {
  console.log(`Downloading ${url}`);
  let body;
  return request(url)
    .then((response) => {
      body = response.body;
      return mkdirp(path.dirname(filename));
    })
    .then(() => writeFile(filename, body))
    .then(() => {
      console.log(`Downloaded and saved: ${url}`);
      return body;
    });
}

function spiderLinks(currentUrl, body, nesting) {
  let promise = Promise.resolve(); // [1]
  if (nesting === 0) {
    return promise;
  }
  const links = utilities.getPageLinks(currentUrl, body);
  links.forEach((link) => {
    promise = promise.then(() => spider(link, nesting - 1));
  });
  return pomise;
}

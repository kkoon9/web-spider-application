spider(process.argv[2], 1)
  .then(() => console.log("Download complete"))
  .catch((err) => console.log(err));

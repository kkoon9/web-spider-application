const request = require("request");
const fs = require("fs");
const mkdirp = require("mkdirp");
const path = require("path");
const utilities = require("./utilities");

function spider(url, nesting, callback) {
  const filename = utilities.urlToFilename(url);
  fs.readFile(filename, "utf8", (err, body) => {
    if (err) {
      if (err.code != "ENOENT") {
        return callback(err);
      }
      return download(url, filename, (err, body) => {
        if (err) {
          return callback(err);
        }
        spiderLinks(url, body, nesting, callback);
      });
    }
    spiderLinks(url, body, nesting, callback);
  });
}

function download(url, filename, callback) {
  console.log(`Downloading ${url}`);
  request(url, (err, response, body) => {
    if (err) {
      return callback(err);
    }
    saveFile(filename, body, (err) => {
      if (err) {
        return callback(err);
      }
      console.log(`Downloaded and saved: ${url}`);
      callback(null, body);
    });
  });
}

function saveFile(filename, contents, callback) {
  mkdirp(path.dirname(filename), (err) => {
    if (err) {
      return callback(err);
    }
    fs.writeFile(filename, contents, callback);
  });
}

function spiderLinks(currentUrl, body, nesting, callbacK) {
  if (nesting === 0) {
    return process.nextTick(callback);
  }
  // [1]. 페이지에 포함된 모든 링크 목록을 가져온다.
  const links = utilities.getPageLinks(currentUrl, body);
  function iterate(index) {
    /**
     * [2]. 링크를 반복한다.
     * iterate()는 분석할 다음 링크의 인덱스를 사용한다.
     * 이 함수는 먼저 인덱스가 링크 배열의 길이가 같은지 확인한다.
     * 이 경우 모든 항목을 처리했으므로 즉시 callback() 함수를 호출한다.
     *
     * */
    if (index === links.length) {
      return callback();
    }

    spider(links[index], nesting - 1, (err) => {
      /**
       * [3]. 이 시점에서 링크를 처리하기 위한 모든 준비가 완료되어야 한다.
       * 중첩 레벨을 줄여 spider() 함수를 호출하고 작업이 완료되면 반복의 다음 단계를 호출한다.
       */
      if (err) {
        return callback(err);
      }
      iterate(index + 1);
    });
  }
  iterate(0); // [4]. spiderLinks() 함수의 마지막 단계에서 iterate(0)을 호출하여 재귀 작업을 시작시킨다.
}

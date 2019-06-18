const URL = require('../url');

async function socket(client) {
  client.on('copy', (message) => {
    copy(message, client);
  });
  client.on('disconnect', () => {
    console.log('Client disconnected');
  });
}

async function copy(json, client) {
  let path = json.path;
  let oldPath = json.oldPath;
  var recursive_copy = require('recursive-copy');

  recursive_copy(URL.directory + oldPath, URL.directory + path, function (error, results) {
    if (error) {
      console.error('Copy failed: ' + error);
      client.emit('copy', { error: error });
    } else {
      console.info('Copied ' + results.length + ' files');
      client.emit('copy', { results: results });
    }
  });
}


module.exports = socket;
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
  console.time('copying');
  let path = json.path;
  let oldPath = json.oldPath;
  fs.stat(URL.directory + oldPath, function (err, stat) {
    if (!err) {
      const filesize = stat.size;
      let bytesCopied = 0;

      const readStream = fs.createReadStream(URL.directory + oldPath);

      readStream.on('data', function (buffer) {
        bytesCopied += buffer.length;
        let percentage = ((bytesCopied / filesize) * 100).toFixed(2);
        console.log(percentage + '%'); // run once with this and later with this line commented
        client.emit('copy', { percentage: percentage });
      });
      readStream.on('end', function () {
        client.emit('copy', { percentage: '100' });
        console.timeEnd('copying');
      });
      readStream.pipe(fs.createWriteStream(URL.directory + path));
    } else {
      client.emit('copy', { error: err });
    }
  })
}

module.exports = socket;
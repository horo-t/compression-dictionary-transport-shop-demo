
const crypto = require('crypto');
const fastify = require('fastify')({
  logger: false,
});
const path = require('path');
const fs = require('fs').promises;

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/', // optional: default '/'
});

async function loadDictionary() {
  const data = await fs.readFile(`data/shop.dict`);
  const hashV1 = crypto.createHash('sha256').update(data).digest('hex');
  const hashV2 = ':' + crypto.createHash('sha256').update(data).digest('base64') + ':';
  const compressed = await fs.readFile(`data/shop.dict.br`);
  return { hashV1: hashV1, hashV2: hashV2, compressed: compressed };
}

async function loadItemData(id) {
  const br = await fs.readFile(`data/${id}.html.br`);
  const sbr = await fs.readFile(`data/${id}.html.sbr`);
  const szst = await fs.readFile(`data/${id}.html.szst`);
  return { id: id, br: br, sbr: sbr, szst: szst };
}


const ITEMS = ['1f3bf', '1f45e', '1f45f', '1f460', '1f461', '1f462', '1f6fc', '1f97e', '1f97f', '1fa70', '1fa74', '26f8'];

async function loadItems() {
  let promises = [];
  ITEMS.forEach((id) => {
    promises.push(loadItemData(id));
  });
  const itmes = await Promise.all(promises);
  let itmesMap = {};
  itmes.forEach((item) => {
    itmesMap[item.id] = item;
  })
  return itmesMap;
}

const dictionaryPromise = loadDictionary();
const itemsPromise = loadItems();

fastify.get(`/dictionary`, async function (request, reply) {
  const dictionary = await dictionaryPromise;
  reply.header('cache-control', 'public, max-age=100');
  reply.header('use-as-dictionary', 'match="/items/*"');
  reply.header('content-encoding', 'br');
  reply.send(Buffer.from(dictionary.compressed));
});

ITEMS.forEach((id) => {
  fastify.get(`/items/${id}.html`, async function (request, reply) {
    const dictionary = await dictionaryPromise;
    const items = await itemsPromise;
    reply.header('content-type', 'text/html; charset=utf-8');
    reply.header('cache-control', 'public, max-age=100');
    reply.header('vary', 'sec-available-dictionary');
    const v1Matched = request.headers['sec-available-dictionary'] == dictionary.hashV1;
    const v2Matched = request.headers['available-dictionary'] == dictionary.hashV2;
    const acceptEncodings = request.headers['accept-encoding'].split(',');
    const sbrSupported = acceptEncodings.some(x => x.trim()=='sbr');
    const szstSupported = acceptEncodings.some(x => x.trim()=='zstd-d');
    if ((v1Matched || v2Matched) && (sbrSupported || szstSupported)) {
      if (v2Matched) {
        reply.header('content-dictionary', dictionary.hashV2);
      }
      if (szstSupported) {
        reply.header('content-encoding', 'zstd-d');
        reply.send(Buffer.from(items[id].szst));
      } else {
        reply.header('content-encoding', v2Matched ? 'br-d' : 'sbr');
        reply.send(Buffer.from(items[id].sbr));
      }
    } else {
      reply.header('content-encoding', 'br');
      reply.send(Buffer.from(items[id].br));
    }
  });
});

fastify.listen(
  { port: process.env.PORT, host: '0.0.0.0' },
  function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
    fastify.log.info(`server listening on ${address}`);
  }
);

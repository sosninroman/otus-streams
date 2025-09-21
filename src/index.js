import { parseArguments } from './parseArguments.js';
import fs from 'node:fs';
import { TextStream } from './textStream.js';
import { isMainThread, parentPort, Worker } from 'node:worker_threads';
import { fileURLToPath } from 'url';

console.log('Hello, Otus!');

if (isMainThread) {
  try {
    const options = parseArguments(process.argv.slice(2));

    console.log('TODO: Обработать файл', options);

    let chunksToProcess = 0;
    Promise.all(
      Array(4)
        .fill()
        .map((_) => {
          return new Promise((resolve, _) => {
            const worker = new Worker(fileURLToPath(import.meta.url));
            worker
              .on('online', () => {
                resolve(worker);
              })
              .on('message', ({ chunk }) => {
                console.log('-- FIle Chunk start --');
                console.log('Chunk:', chunk.toString().trim());
                console.log('-- FIle Chunk end --');
                if (!--chunksToProcess) {
                  process.exit();
                }
              });
          });
        })
    ).then((workers) => {
      let i = 0;
      const textStream = fs.createReadStream(options.path, {
        encoding: 'utf8',
      });

      const lineSplitter = new TextStream();

      textStream.pipe(lineSplitter).on('data', (chunkBuf) => {
        const worker = workers[i % 4];
        ++i;
        worker.postMessage({ chunk: chunkBuf.toString().trim() });
        ++chunksToProcess;
      });
    });
  } catch (error) {
    console.warn('Ошибка выполнения скрипта:', error);
  }
} else {
  parentPort.on('message', ({ chunk }) => {
    parentPort.postMessage({ chunk });
  });
}

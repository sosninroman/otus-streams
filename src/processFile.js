import fs from 'node:fs';
import { TextStream } from './textStream.js';
import { isMainThread, parentPort, Worker } from 'node:worker_threads';
import { fileURLToPath } from 'url';

console.log('Hello, Otus!');

export function processFile(path, threadsCount = 4) {
  if (isMainThread) {
    let chunksToProcess = 0;
    Promise.all(
      Array(threadsCount)
        .fill()
        .map(() => {
          return new Promise((resolve) => {
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
      const textStream = fs.createReadStream(path, {
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
  } else {
    parentPort.on('message', ({ chunk }) => {
      parentPort.postMessage({ chunk });
    });
  }
}

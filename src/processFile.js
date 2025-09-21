import fs from 'node:fs';
import { TextStream } from './textStream.js';
import { Worker } from 'node:worker_threads';

export async function processFile(path, threadsCount = 4) {
  return new Promise((resolveFileProcessing) => {
    let chunksToProcess = 0;
    const resultIndex = new Map();
    Promise.all(
      Array(threadsCount)
        .fill()
        .map(() => {
          return new Promise((resolveWorkerCreation) => {
            const worker = new Worker('./src/processFileChunk.js');
            worker
              .on('online', () => {
                resolveWorkerCreation(worker);
              })
              .on('message', ({ wordsIndex }) => {
                for (const [word, count] of Object.entries(wordsIndex)) {
                  resultIndex.set(word, (resultIndex.get(word) || 0) + count);
                }
                if (!--chunksToProcess) {
                  resolveFileProcessing(resultIndex);
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
  });
}

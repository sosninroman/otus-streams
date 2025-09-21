import { parentPort } from 'node:worker_threads';

parentPort.on('message', ({ chunk }) => {
  const words = chunk
    .toString()
    .trim()
    .replace(/[^a-zA-Z\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  const wordsIndex = new Map();
  for (const word of words) {
    if (wordsIndex.has(word)) {
      wordsIndex.set(word, wordsIndex.get(word) + 1);
    } else {
      wordsIndex.set(word, 1);
    }
  }
  parentPort.postMessage({
    wordsIndex: Object.fromEntries(wordsIndex.entries()),
  });
});

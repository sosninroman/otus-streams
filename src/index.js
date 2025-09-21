import { parseArguments } from './parseArguments.js';
import { processFile } from './processFile.js';
import fs from 'fs';

try {
  const options = parseArguments(process.argv.slice(2));
  const resultIndex = await processFile(options.input);
  const sortedValues = [...resultIndex.entries()]
    .sort((lhs, rhs) => {
      return lhs[0].localeCompare(rhs[0]);
    })
    .map((entry) => entry[1]);
  const writeStream = fs.createWriteStream(options.output, {
    encoding: 'utf8',
  });
  for (const value of sortedValues) {
    writeStream.write(value.toString() + '\n');
  }

  writeStream.end();

  writeStream.on('finish', () => {
    console.log('Скрипт успешно выполнен');
    process.exit();
  });

  writeStream.on('error', (err) => {
    console.error('Ошибка записи:', err);
    process.exit();
  });
} catch (error) {
  console.warn('Ошибка выполнения скрипта:', error);
}

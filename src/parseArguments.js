import fs from 'node:fs';

function isFile(path) {
  try {
    const stat = fs.statSync(path);
    return stat.isFile();
  } catch (error) {
    throw Error('Не удалось получить данные о переданном пути:', error);
  }
}

export function parseArguments(options) {
  if (options.length < 2) {
    throw Error('Необходимо передать путь к входному и выходному файлам');
  }
  const [input, output] = options;
  if (!isFile(input)) {
    throw Error('Переданный аргумент не является путем к файлу');
  }
  return { input, output };
}

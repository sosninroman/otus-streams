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
  if (options.length < 1) {
    throw Error('Необходимо передать путь к файлу');
  }
  const path = options[0];
  if (!isFile(path)) {
    throw Error('Переданный аргумент не является путем к файлу');
  }
  return { path };
}

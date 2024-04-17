import sharp from 'sharp';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as xml2js from 'xml2js';
import { readFile, rename, rmSync } from 'fs';
import { resolve } from 'path';
import { ranDomImagePath } from '.';

const parser = new xml2js.Parser();

/**
 * remove file with argument is path of file in storage folder
 */
export function removeFile(path: string): void {
  rmSync(path, { force: true });
}

/**
 * Func rename file name, move file to new path
 * @param originalFileName
 * @returns
 */
export function renameFile(originalFileName: string): string {
  const dotIndex = originalFileName.lastIndexOf('.');

  if (dotIndex !== -1) {
    const fileName = originalFileName.slice(0, dotIndex);
    const fileExtension = originalFileName.slice(dotIndex);

    const newFileName = fileName + '1' + fileExtension;
    return newFileName;
  } else {
    return originalFileName + '1';
  }
}

/**
 * remove mul file with argument is path of file in storage folder
 */
export function removeFiles(files: string[]): void {
  files.forEach(async (i) => {
    rmSync(i, { force: true });
  });
}

export function getMedia(file: string): void {
  new Promise((resolve, reject) =>
    readFile(file, (err, content) => (err ? reject(err) : resolve(content))),
  );
}

export function moveFile(oldPath: string, newPath: string): void {
  rename(oldPath, newPath, function (err) {
    if (err) {
      console.log(err);
      return;
    }
  });
}

export async function resizeImage(
  path: string,
  dimension: { height: number; width: number },
): Promise<string> {
  const newName = ranDomImagePath(
    path.split('/')[path.split('/').length - 1].slice(0, -4),
  );
  const formatFile = path.slice(-4);
  const newPath = `${path.substring(
    0,
    path.lastIndexOf('/') + 1,
  )}${newName.toLowerCase()}${formatFile}`;
  const originalPath = resolve(__dirname, `../../../${path}`);
  await sharp(originalPath)
    .rotate()
    .resize(dimension.width, dimension.height, {
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    })
    .toFile(newPath);

  removeFile(originalPath);
  return newPath;
}

export async function getDAtributeInSvg(path: string): Promise<string[]> {
  const dataFromFile = fs.readFileSync(
    resolve(__dirname, `../../../${path}`),
    'utf8',
  );
  const parserData = await parser.parseStringPromise(dataFromFile);
  const d = parserData.svg.path.map((item) => item.$.d);
  return d;
}

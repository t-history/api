import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { S3Service } from './s3.service';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  pbkdf2Sync,
} from 'crypto';
import { createWriteStream, readFileSync } from 'fs';
import { open } from 'node:fs/promises';
import { pipeline } from 'stream';

@Injectable()
export class BackupService {
  constructor(private s3Service: S3Service) {}

  async backup(): Promise<void> {
    const dbName = process.env.MONGODB_DB_NAME;
    const mongoUri = process.env.MONGO_CONNECTION_STRING;

    const BUCKET = process.env.S3_BACKUP_BUCKET;
    const ALGORITHM = 'aes-256-cbc';
    const PASSWORD = process.env.ENCRYPTION_PASSWORD;
    const IV = randomBytes(16);
    const SALT = randomBytes(64);
    const ITERATIONS = 100000;
    const KEY_LENGTH = 32;

    const OUTPUT_FILE = `backup-${dbName}-${Date.now()}.archive.gz.aes`;
    const OUTPUT_FILE_PATH = `backups/${OUTPUT_FILE}`;

    const command = `mongodump`;
    const args = [`--uri="${mongoUri}"`, `--db`, dbName, `--gzip`, `--archive`];

    const mongodump = spawn(command, args);
    const writeStream = createWriteStream(OUTPUT_FILE_PATH);

    const key = pbkdf2Sync(PASSWORD, SALT, ITERATIONS, KEY_LENGTH, 'sha256');
    const cipher = createCipheriv(ALGORITHM, key, IV);

    console.log('Encrypting dump...', key);

    writeStream.write(SALT);
    writeStream.write(IV);

    pipeline(mongodump.stdout, cipher, writeStream, (err) => {
      if (err) {
        console.error('Failed to create encrypted dump:', err);
      } else {
        // read file as buffer
        const buffer = readFileSync(OUTPUT_FILE_PATH);

        this.s3Service.uploadFile(BUCKET, OUTPUT_FILE, buffer);
        console.log('Encrypted dump successfully created:', OUTPUT_FILE_PATH);
      }
    });
  }

  // manual restore db using this decrypted file downloaded from s3
  // after dectypting the file, you should unarchive gz file and recieve .archive file
  // then you can restore db using this command:
  // mongorestore --uri="mongodb://<MONGO_HOST>>:<MONGO_PORT>/<MONGODB_DB_NAME>" --archive=backup-thistory-<time>.archive
  async restore(filename): Promise<void> {
    const ALGORITHM = 'aes-256-cbc';
    const PASSWORD = process.env.ENCRYPTION_PASSWORD;
    const ITERATIONS = 100000;
    const KEY_LENGTH = 32;

    const localFilename = `backups/${filename}`;
    const localFinaleFilename = `backups/${filename}.gz`;

    // read file as stream from local file system
    // and get salt and iv from header
    const openFile = await open(localFilename);
    const header = Buffer.alloc(80);
    await openFile.read(header, 0, 80, 0);

    const salt = header.subarray(0, 64);
    const iv = header.subarray(64, 80);

    // decrypt file
    const key = pbkdf2Sync(PASSWORD, salt, ITERATIONS, KEY_LENGTH, 'sha256');
    const decipher = createDecipheriv(ALGORITHM, key, iv);

    const readStream = openFile.createReadStream({ start: 80 });
    const writeStream = createWriteStream(localFinaleFilename);

    pipeline(readStream, decipher, writeStream, (err) => {
      if (err) {
        console.error('Failed to decrypt and write to file:', err);
      } else {
        console.log(
          'Decrypted data successfully written to file:',
          localFinaleFilename,
        );
      }
    });
  }
}

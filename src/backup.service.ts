import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { S3Service } from './s3.service';
import { createCipheriv, randomBytes, pbkdf2Sync } from 'crypto';
import { createWriteStream, readFileSync, createReadStream } from 'fs';
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

    console.log(`Running command: ${command} ${args.join(' ')}`);

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
}

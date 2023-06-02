import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
      region: process.env.AWS_REGION,
    });

    console.log('S3Service initialized');
  }

  async uploadFile(bucket: string, key: string, buffer: Buffer): Promise<void> {
    const params = {
      Bucket: bucket,
      Key: key,
      Body: buffer,
    };

    await this.s3Client.send(new PutObjectCommand(params));
    console.log(`File uploaded successfully at ${key}`);
  }

  async downloadFile(bucket: string, key: string): Promise<Readable> {
    const params = {
      Bucket: bucket,
      Key: key,
    };

    const command = new GetObjectCommand(params);
    const { Body } = await this.s3Client.send(command);

    console.log(`File downloaded successfully at ${key}`);

    return Body as Readable;
  }
}

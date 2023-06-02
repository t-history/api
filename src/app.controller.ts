import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { BackupService } from './backup.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly backupService: BackupService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/backup')
  async createBackup(): Promise<string> {
    await this.backupService.backup();
    return 'Backup successfully uploaded to S3';
  }

  // @Get('/restore')
  // async createRestore(): Promise<string> {
  //   console.log('restore');
  //   await this.backupService.restore();
  //   return 'Restore successfully downloaded from S3';
  // }
}

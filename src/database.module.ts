import { Global, Module, Provider } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';

const mongoProvider: Provider = {
  provide: 'DATABASE_CONNECTION',
  useFactory: async (): Promise<Db> => {
    const client = await MongoClient.connect(
      process.env.MONGO_CONNECTION_STRING,
    );
    return client.db(process.env.MONGO_DB_NAME);
  },
};

@Global()
@Module({
  providers: [mongoProvider],
  exports: [mongoProvider],
})
export class DatabaseModule {}

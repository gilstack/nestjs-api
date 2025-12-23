import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { TypedConfigService } from './config.service';
import { configs } from './index';

@Global()
@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
            load: configs,
            cache: true,
            expandVariables: true,
        }),
    ],
    providers: [TypedConfigService],
    exports: [TypedConfigService],
})
export class ConfigModule { }

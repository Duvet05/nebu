import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToysController } from './controllers/toys.controller';
import { ProductCatalogController } from './controllers/product-catalog.controller';
import { ToysService } from './services/toys.service';
import { ProductCatalogService } from './services/product-catalog.service';
import { ProductSeedService } from './services/product-seed.service';
import { Toy } from './entities/toy.entity';
import { ProductCatalog } from './entities/product-catalog.entity';
import { User } from '../users/entities/user.entity';
import { IoTDevice } from '../iot/entities/iot-device.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Toy, ProductCatalog, User, IoTDevice]),
  ],
  controllers: [ToysController, ProductCatalogController],
  providers: [ToysService, ProductCatalogService, ProductSeedService],
  exports: [ToysService, ProductCatalogService, ProductSeedService], // Exportar los servicios para uso en otros módulos
})
export class ToysModule {}

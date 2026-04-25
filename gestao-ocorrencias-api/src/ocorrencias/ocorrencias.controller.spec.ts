import { Test, TestingModule } from '@nestjs/testing';
import { OcorrenciasController } from './ocorrencias.controller';

describe('OcorrenciasController', () => {
  let controller: OcorrenciasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OcorrenciasController],
    }).compile();

    controller = module.get<OcorrenciasController>(OcorrenciasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

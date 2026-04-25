import { Test, TestingModule } from '@nestjs/testing';
import { OcorrenciasService } from './ocorrencias.service';

describe('OcorrenciasService', () => {
  let service: OcorrenciasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OcorrenciasService],
    }).compile();

    service = module.get<OcorrenciasService>(OcorrenciasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

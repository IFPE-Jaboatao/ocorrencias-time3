// src/dominio/auth/perfis.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { PerfilUsuario } from '../enums';

export const PERFIS_KEY = 'perfis';
export const Perfis = (...perfis: PerfilUsuario[]) => SetMetadata(PERFIS_KEY, perfis);
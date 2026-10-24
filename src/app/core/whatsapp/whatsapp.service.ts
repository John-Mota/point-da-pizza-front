import { Injectable, InjectionToken, inject, isDevMode } from '@angular/core';
import { environment } from '../../../environments/environment.generated';

/**
 * Token de injeção para o número bruto do WhatsApp (vindo do environment.generated.ts).
 * Permite sobrescrever facilmente em testes unitários.
 */
export const WHATSAPP_RAW_NUMBER = new InjectionToken<string>('WHATSAPP_RAW_NUMBER', {
  providedIn: 'root',
  factory: () => environment.whatsapp ?? '',
});

/**
 * Formata um número de 10 ou 11 dígitos no padrão brasileiro (DD) NNNNN-NNNN.
 */
export function formatarTelefoneBr(digitos: string): string {
  const limpo = (digitos ?? '').replace(/\D/g, '');
  if (limpo.length === 11) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`;
  }
  if (limpo.length === 10) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`;
  }
  return '';
}

@Injectable({
  providedIn: 'root',
})
export class WhatsappService {
  private readonly rawValue = inject(WHATSAPP_RAW_NUMBER);

  /** Número normalizado em dígitos com DDI 55 quando válido (10 ou 11 dígitos locais). */
  readonly numero: string;

  /** Indica se há um número de WhatsApp válido (10 ou 11 dígitos com DDD). */
  readonly disponivel: boolean;

  /** Apenas os 10 ou 11 dígitos locais (sem 55), quando disponível. */
  readonly digitosLocais: string;

  /** Número formatado para exibição humana: (DD) 9XXXX-XXXX. */
  readonly numeroFormatado: string;

  constructor() {
    const apenasDigitos = (this.rawValue ?? '').replace(/\D/g, '');
    const valido = apenasDigitos.length >= 10 && apenasDigitos.length <= 11;

    if (!valido) {
      this.disponivel = false;
      this.numero = '';
      this.digitosLocais = '';
      this.numeroFormatado = '';

      if (isDevMode()) {
        console.warn(
          '[WhatsappService] Número de WhatsApp ausente ou inválido (deve conter 10 ou 11 dígitos com DDD, sem 55).'
        );
      }
    } else {
      this.disponivel = true;
      this.digitosLocais = apenasDigitos;
      this.numero = `55${apenasDigitos}`;
      this.numeroFormatado = formatarTelefoneBr(apenasDigitos);
    }
  }

  /**
   * Gera o link oficial do WhatsApp (`https://wa.me/{numero}` ou com `?text=...`).
   * Retorna string vazia caso o WhatsApp não esteja disponível.
   */
  link(mensagem?: string): string {
    if (!this.disponivel || !this.numero) {
      return '';
    }

    if (mensagem !== undefined && mensagem.length > 0) {
      return `https://wa.me/${this.numero}?text=${encodeURIComponent(mensagem)}`;
    }

    return `https://wa.me/${this.numero}`;
  }
}


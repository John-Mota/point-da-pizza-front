import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { API_BASE_URL, construirUrlApi } from '../../../core/api';
import { Loja } from '../../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class LojaService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private cacheLoja$?: Observable<Loja>;

  obterLoja(): Observable<Loja> {
    if (!this.cacheLoja$) {
      const url = construirUrlApi(this.apiBaseUrl, '/loja');
      this.cacheLoja$ = this.http.get<Loja>(url).pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.cacheLoja$;
  }

  invalidarCache(): void {
    this.cacheLoja$ = undefined;
  }
}

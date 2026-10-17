import {
  ApplicationConfig,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { PRIME_NG_CONFIG, PrimeNG, PrimeNGConfigType } from 'primeng/config';
import { routes } from './app.routes';

const PointDaPizzaPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{orange.50}',
      100: '{orange.100}',
      200: '{orange.200}',
      300: '{orange.300}',
      400: '{orange.400}',
      500: '#F58220',
      600: '#C2410C',
      700: '{orange.700}',
      800: '{orange.800}',
      900: '{orange.900}',
      950: '{orange.950}',
    },
  },
});

const primeNgConfig: PrimeNGConfigType = {
  ripple: true,
  theme: {
    preset: PointDaPizzaPreset,
    options: {
      darkModeSelector: '[data-theme="dark"]',
    },
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    makeEnvironmentProviders([
      { provide: PRIME_NG_CONFIG, useValue: primeNgConfig },
      provideAppInitializer(() => {
        const primeNg = inject(PrimeNG);
        primeNg.setConfig(primeNgConfig);
        primeNg._setVerified(true);
      }),
    ]),
  ],
};

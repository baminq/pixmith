import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SettingsService } from '../services/settings.service';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const settingsService = inject(SettingsService);
  const activeModel = settingsService.getActiveModel();

  if (req.url.startsWith('/api') && settingsService.hasAnyApiKey()) {
    // For custom API, don't send the stored Tongyi/Doubao key as header.
    // Components will send custom config in the request body instead.
    if (activeModel === 'custom') {
      return next(req);
    }

    const apiKey = settingsService.getCurrentActiveApiKey();
    const clonedRequest = req.clone({
      setHeaders: {
        'X-API-Key': apiKey,
      },
    });
    return next(clonedRequest);
  }

  return next(req);
};

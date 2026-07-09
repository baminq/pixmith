import { HttpInterceptorFn } from '@angular/common/http';

/**
 * OpenAI-compatible custom APIs send credentials in the request body
 * (custom_api_key / custom_base_url / custom_model), not via X-API-Key.
 */
export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};

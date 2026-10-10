import type { Messages } from '../i18n/en';

interface ApiErrorShape {
  response?: {
    status?: number;
    data?: { message?: string; details?: string[] };
  };
}

/**
 * Builds a message in the active language from the kind of failure, then appends
 * whatever the API actually returned (for example "Only admins can manage skill
 * profiles"), untranslated, so failures still explain themselves.
 */
export function formatApiError(error: unknown, t: Messages, operationFailed: string): string {
  const response = (error as ApiErrorShape | null)?.response;

  let headline: string;
  if (!response) {
    headline = t.errors.network;
  } else {
    switch (response.status) {
      case 400:
        headline = t.errors.validation;
        break;
      case 403:
        headline = t.errors.forbidden;
        break;
      case 404:
        headline = t.errors.notFound;
        break;
      case 409:
        headline = t.errors.conflict;
        break;
      default:
        headline = operationFailed;
    }
  }

  const data = response?.data;
  const detailParts = [data?.message, data?.details?.length ? data.details.join(', ') : undefined]
    .filter((part): part is string => Boolean(part));

  return detailParts.length ? `${headline}: ${detailParts.join(': ')}` : headline;
}

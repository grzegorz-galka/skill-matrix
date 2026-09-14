/**
 * Pulls the message the API actually returned, so failures explain themselves
 * (for example "Only admins can manage skill profiles") instead of showing a
 * generic fallback.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { data?: { message?: string; details?: string[] } } })?.response;
  const data = response?.data;

  if (data?.details?.length) {
    return `${data.message || fallback}: ${data.details.join(', ')}`;
  }
  return data?.message || fallback;
}

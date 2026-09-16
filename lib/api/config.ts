export function getApiBaseUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured')
  }

  return apiUrl.replace(/\/$/, '')
}

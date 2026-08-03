export function decodeJwtPayload(token: string): unknown {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return { error: 'Not a JWT' }
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4) b64 += '='
    const json = decodeURIComponent(
      atob(b64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json)
  } catch (e) {
    return { error: 'Failed to decode id_token', detail: String(e) }
  }
}

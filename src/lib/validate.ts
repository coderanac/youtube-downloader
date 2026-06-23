const ALLOWED_HOSTS: Record<string, string> = {
  'www.youtube.com': 'YouTube',
  'youtube.com': 'YouTube',
  'youtu.be': 'YouTube',
  'm.youtube.com': 'YouTube',
  'www.tiktok.com': 'TikTok',
  'tiktok.com': 'TikTok',
  'vm.tiktok.com': 'TikTok',
  'vt.tiktok.com': 'TikTok',
  'm.tiktok.com': 'TikTok',
  'www.instagram.com': 'Instagram',
  'instagram.com': 'Instagram',
}

export function isValidUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url)
    return hostname in ALLOWED_HOSTS
  } catch {
    return false
  }
}

export function platformOf(url: string): string | null {
  try {
    const { hostname } = new URL(url)
    return ALLOWED_HOSTS[hostname] ?? null
  } catch {
    return null
  }
}

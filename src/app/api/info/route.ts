import { spawn } from 'child_process'
import { NextRequest, NextResponse } from 'next/server'
import type { VideoFormat } from '@/types'
import { isValidUrl } from '@/lib/validate'

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const { url } = body as { url?: string }

  if (!url || !isValidUrl(url)) {
    return NextResponse.json({ error: 'URL inválida. Suportamos YouTube, TikTok e Instagram.' }, { status: 400 })
  }

  return new Promise<NextResponse>((resolve) => {
    const proc = spawn('yt-dlp', ['--dump-json', '--no-playlist', url])
    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString() })
    proc.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString() })

    proc.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'ENOENT') {
        resolve(NextResponse.json(
          { error: 'yt-dlp não encontrado. Instale com: sudo pacman -S yt-dlp' },
          { status: 500 },
        ))
      } else {
        resolve(NextResponse.json({ error: `Erro ao iniciar yt-dlp: ${err.message}` }, { status: 500 }))
      }
    })

    proc.on('close', (code) => {
      if (code !== 0) {
        const reason = stderr
          .split('\n')
          .filter((l) => l.toLowerCase().includes('error') || l.toLowerCase().includes('unable'))
          .at(-1)
          ?.trim()

        resolve(NextResponse.json(
          { error: reason ?? 'Não foi possível obter informações do vídeo. Verifique a URL.' },
          { status: 500 },
        ))
        return
      }

      try {
        const raw = JSON.parse(stdout)

        const formats: VideoFormat[] = (raw.formats as VideoFormat[] ?? [])
          .filter((f) => f.ext && (f.vcodec !== 'none' || f.acodec !== 'none'))
          .map((f) => ({
            format_id: f.format_id,
            ext: f.ext,
            resolution: (f as { resolution?: string }).resolution
              ?? ((f as unknown as { height?: number }).height ? `${(f as unknown as { height: number }).height}p` : 'audio'),
            filesize: (f as { filesize?: number; filesize_approx?: number }).filesize
              ?? (f as { filesize_approx?: number }).filesize_approx
              ?? null,
            vcodec: f.vcodec,
            acodec: f.acodec,
            format_note: (f as { format_note?: string }).format_note ?? '',
          }))
          .filter((f, i, arr) =>
            arr.findIndex((x) => x.resolution === f.resolution && x.ext === f.ext) === i,
          )

        resolve(NextResponse.json({
          title: raw.title as string,
          thumbnail: raw.thumbnail as string,
          duration: (raw.duration_string as string | undefined) ?? formatDuration(raw.duration as number),
          channel: (raw.channel as string | undefined) ?? (raw.uploader as string | undefined) ?? '',
          formats,
        }))
      } catch {
        resolve(NextResponse.json({ error: 'Erro ao processar informações do vídeo.' }, { status: 500 }))
      }
    })
  })
}

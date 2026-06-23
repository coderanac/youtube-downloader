import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { NextRequest } from 'next/server'
import { isValidUrl } from '@/lib/validate'

export const dynamic = 'force-dynamic'

function send(controller: ReadableStreamDefaultController, encoder: TextEncoder, data: object) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const url = searchParams.get('url') ?? ''
  const formatId = searchParams.get('format_id') ?? 'bestvideo+bestaudio/best'

  if (!url || !isValidUrl(url)) {
    return new Response(JSON.stringify({ error: 'URL inválida.' }), { status: 400 })
  }

  const encoder = new TextEncoder()
  const outputTemplate = join(tmpdir(), '%(title)s.%(ext)s')

  const stream = new ReadableStream({
    start(controller) {
      const args = [
        '--no-playlist',
        '-f', formatId,
        '--merge-output-format', 'mp4',
        '-o', outputTemplate,
        '--print', 'after_move:filepath',
        url,
      ]

      const proc = spawn('yt-dlp', args)
      let filePath = ''

      proc.on('error', (err: NodeJS.ErrnoException) => {
        const msg = err.code === 'ENOENT'
          ? 'yt-dlp não encontrado. Instale com: sudo pacman -S yt-dlp'
          : `Erro ao iniciar yt-dlp: ${err.message}`
        send(controller, encoder, { error: msg })
        controller.close()
      })

      request.signal.addEventListener('abort', () => {
        proc.kill('SIGTERM')
        controller.close()
      })

      proc.stdout.on('data', (chunk: Buffer) => {
        const line = chunk.toString().trim()
        if (line && existsSync(line)) filePath = line
        send(controller, encoder, { progress: line })
      })

      proc.stderr.on('data', (chunk: Buffer) => {
        send(controller, encoder, { log: chunk.toString().trim() })
      })

      proc.on('close', (code) => {
        if (code !== 0 || !filePath) {
          send(controller, encoder, { error: 'Erro ao baixar o vídeo.' })
        } else {
          const filename = filePath.split('/').pop() ?? 'video.mp4'
          send(controller, encoder, { done: true, file: filename, path: filePath })
        }
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

function isValidYoutubeUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url)
    return ['www.youtube.com', 'youtube.com', 'youtu.be', 'm.youtube.com'].includes(hostname)
  } catch {
    return false
  }
}

function send(controller: ReadableStreamDefaultController, encoder: TextEncoder, data: object) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const url = searchParams.get('url') ?? ''
  const formatId = searchParams.get('format_id') ?? 'bestvideo+bestaudio/best'

  if (!url || !isValidYoutubeUrl(url)) {
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

import { createReadStream, existsSync, unlink } from 'fs'
import { tmpdir } from 'os'
import { basename } from 'path'
import { NextRequest } from 'next/server'
import { Readable } from 'stream'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const filePath = request.nextUrl.searchParams.get('path') ?? ''

  if (!filePath || !filePath.startsWith(tmpdir())) {
    return new Response(JSON.stringify({ error: 'Acesso negado.' }), { status: 403 })
  }

  if (!existsSync(filePath)) {
    return new Response(JSON.stringify({ error: 'Arquivo não encontrado.' }), { status: 404 })
  }

  const filename = basename(filePath)
  const nodeStream = createReadStream(filePath)

  nodeStream.on('end', () => unlink(filePath, () => {}))

  const webStream = Readable.toWeb(nodeStream) as ReadableStream

  return new Response(webStream, {
    headers: {
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Content-Type': 'application/octet-stream',
    },
  })
}

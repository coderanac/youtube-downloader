'use client'

import { useState } from 'react'
import { SearchForm } from '@/components/SearchForm'
import { VideoCard } from '@/components/VideoCard'
import { FormatList } from '@/components/FormatList'
import { DownloadProgress } from '@/components/DownloadProgress'
import type { VideoInfo, VideoFormat, DownloadEvent } from '@/types'
import styles from './page.module.css'

function parseProgressPercent(line: string): number | null {
  const match = line.match(/(\d+(?:\.\d+)?)%/)
  return match ? parseFloat(match[1]) : null
}

export default function HomePage() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [downloadLog, setDownloadLog] = useState<string[]>([])
  const [downloadDone, setDownloadDone] = useState<{ filename: string; path: string } | null>(null)

  async function handleSearch(url: string) {
    setSearchError(null)
    setVideoInfo(null)
    setDownloadDone(null)
    setDownloading(false)
    setSearching(true)

    try {
      const response = await fetch('/api/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await response.json() as VideoInfo & { error?: string }

      if (!response.ok) {
        setSearchError(data.error ?? 'Erro desconhecido ao buscar o vídeo.')
        return
      }

      setVideoInfo(data)
    } catch {
      setSearchError('Não foi possível conectar ao servidor.')
    } finally {
      setSearching(false)
    }
  }

  function handleDownload(format: VideoFormat) {
    if (!videoInfo || downloading) return

    const url = (document.getElementById('youtube-url') as HTMLInputElement | null)?.value ?? ''
    if (!url) return

    setDownloading(true)
    setDownloadDone(null)
    setDownloadProgress(0)
    setDownloadLog([])

    const params = new URLSearchParams({ url, format_id: format.format_id })
    const eventSource = new EventSource(`/api/download?${params}`)

    eventSource.onmessage = (event: MessageEvent<string>) => {
      const data = JSON.parse(event.data) as DownloadEvent

      if (data.error) {
        eventSource.close()
        setDownloading(false)
        setSearchError(data.error)
        return
      }

      const line = data.log ?? data.progress ?? ''
      if (line) {
        setDownloadLog((prev) => [...prev, line])
        const percent = parseProgressPercent(line)
        if (percent !== null) setDownloadProgress(percent)
      }

      if (data.done && data.file && data.path) {
        eventSource.close()
        setDownloading(false)
        setDownloadProgress(100)
        setDownloadDone({ filename: data.file, path: data.path })
      }
    }

    eventSource.onerror = () => {
      eventSource.close()
      setDownloading(false)
      setSearchError('Conexão perdida durante o download.')
    }
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logoWrapper}>
          <svg
            className={styles.logoIcon}
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="36" height="36" rx="10" fill="#ff4444" />
            <path d="M14 11l10 7-10 7V11z" fill="white" />
          </svg>
          <h1 className={styles.title}>YT Downloader</h1>
        </div>
        <p className={styles.subtitle}>Cole o link do YouTube e escolha o formato</p>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <SearchForm onSearch={handleSearch} loading={searching} />

          {searchError && (
            <p role="alert" className={styles.errorMessage}>
              {searchError}
            </p>
          )}

          {videoInfo && (
            <>
              <hr className={styles.divider} />
              <VideoCard info={videoInfo} />
              <hr className={styles.divider} />
              <FormatList
                formats={videoInfo.formats}
                onDownload={handleDownload}
                disabled={downloading}
              />
            </>
          )}

          {(downloading || downloadDone) && (
            <>
              <hr className={styles.divider} />
              <DownloadProgress
                progress={downloadProgress}
                log={downloadLog}
                done={downloadDone}
              />
            </>
          )}
        </div>
      </main>
    </>
  )
}

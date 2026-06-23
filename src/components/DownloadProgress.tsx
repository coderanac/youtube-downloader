'use client'

import { useEffect, useRef } from 'react'
import styles from './DownloadProgress.module.css'

interface DownloadProgressProps {
  progress: number
  log: string[]
  done: { filename: string; path: string } | null
}

export function DownloadProgress({ progress, log, done }: DownloadProgressProps) {
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [log])

  return (
    <section
      className={styles.section}
      aria-label="Progresso do download"
      aria-live="polite"
      aria-busy={done == null}
    >
      <h3 className={styles.heading}>{done ? 'Download concluído!' : 'Baixando…'}</h3>

      {progress > 0 ? (
        <progress
          className={styles.progressBar}
          value={progress}
          max={100}
          aria-label={`${Math.round(progress)}% concluído`}
        />
      ) : (
        <progress className={`${styles.progressBar} ${styles.indeterminate}`} aria-label="Download em andamento" />
      )}

      <div
        ref={logRef}
        role="log"
        aria-live="off"
        aria-label="Log do download"
        className={styles.log}
      >
        <pre>{log.join('\n')}</pre>
      </div>

      {done && (
        <p role="status" className={styles.successMessage}>
          <a
            href={`/api/file?path=${encodeURIComponent(done.path)}`}
            download={done.filename}
            className={styles.downloadLink}
          >
            Salvar arquivo: {done.filename}
          </a>
        </p>
      )}
    </section>
  )
}

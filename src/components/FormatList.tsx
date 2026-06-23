import type { VideoFormat } from '@/types'
import styles from './FormatList.module.css'

interface FormatListProps {
  formats: VideoFormat[]
  onDownload: (format: VideoFormat) => void
  disabled: boolean
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
  return `${(bytes / 1e3).toFixed(0)} KB`
}

export function FormatList({ formats, onDownload, disabled }: FormatListProps) {
  return (
    <section className={styles.section} aria-label="Formatos disponíveis para download">
      <h3 className={styles.heading}>Formatos disponíveis</h3>
      <ul className={styles.list} role="list">
        {formats.map((format) => {
          const isAudioOnly = format.vcodec === 'none'
          return (
            <li key={format.format_id} className={styles.item}>
              <article className={styles.formatCard}>
                <span
                  className={`${styles.badge} ${isAudioOnly ? styles.audioBadge : styles.videoBadge}`}
                  aria-label={isAudioOnly ? 'Apenas áudio' : 'Vídeo'}
                >
                  {isAudioOnly ? 'Áudio' : 'Vídeo'}
                </span>
                <div className={styles.info}>
                  <p className={styles.resolution}>
                    {format.resolution}
                    <span className={styles.ext}>.{format.ext}</span>
                  </p>
                  {format.format_note && (
                    <p className={styles.note}>{format.format_note}</p>
                  )}
                </div>
                {format.filesize != null && (
                  <span className={styles.filesize}>{formatFileSize(format.filesize)}</span>
                )}
                <button
                  type="button"
                  className={styles.downloadButton}
                  onClick={() => onDownload(format)}
                  disabled={disabled}
                  aria-label={`Baixar ${format.resolution} .${format.ext}`}
                >
                  Baixar
                </button>
              </article>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

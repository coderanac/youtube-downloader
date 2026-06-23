import type { VideoInfo } from '@/types'
import styles from './VideoCard.module.css'

interface VideoCardProps {
  info: VideoInfo
}

export function VideoCard({ info }: VideoCardProps) {
  return (
    <article className={styles.card} aria-label={`Vídeo: ${info.title}`}>
      <figure className={styles.figure}>
        <img
          src={info.thumbnail}
          alt={`Thumbnail do vídeo: ${info.title}`}
          className={styles.thumbnail}
          width={160}
          height={90}
        />
      </figure>
      <div className={styles.details}>
        <h2 className={styles.title}>{info.title}</h2>
        <p className={styles.meta}>
          {info.channel && <span className={styles.channel}>{info.channel}</span>}
          {info.channel && info.duration && <span aria-hidden="true" className={styles.separator}>·</span>}
          {info.duration && <time className={styles.duration}>{info.duration}</time>}
        </p>
      </div>
    </article>
  )
}

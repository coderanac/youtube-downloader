export interface VideoFormat {
  format_id: string
  ext: string
  resolution: string
  filesize: number | null
  vcodec: string
  acodec: string
  format_note: string
}

export interface VideoInfo {
  title: string
  thumbnail: string
  duration: string
  channel: string
  formats: VideoFormat[]
}

export interface DownloadEvent {
  progress?: string
  log?: string
  done?: boolean
  file?: string
  path?: string
  error?: string
}

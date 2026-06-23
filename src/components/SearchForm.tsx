'use client'

import { useState } from 'react'
import styles from './SearchForm.module.css'

interface SearchFormProps {
  onSearch: (url: string) => void
  loading: boolean
}

export function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [url, setUrl] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = url.trim()
    if (trimmed) onSearch(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <label htmlFor="youtube-url" className={styles.label}>
        URL do YouTube
      </label>
      <div className={styles.inputGroup} role="group" aria-label="Campo de URL e botão de busca">
        <input
          id="youtube-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className={styles.input}
          required
          disabled={loading}
          aria-busy={loading}
          autoComplete="url"
          spellCheck={false}
        />
        <button
          type="submit"
          className={styles.button}
          disabled={loading || !url.trim()}
          aria-label={loading ? 'Buscando vídeo, aguarde...' : 'Buscar vídeo'}
        >
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </div>
    </form>
  )
}

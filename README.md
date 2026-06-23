# Video Downloader

Aplicação web para baixar vídeos do YouTube, TikTok e Instagram diretamente pelo navegador. Cole a URL, escolha o formato e a qualidade, e o arquivo é salvo no seu computador.

> **Uso pessoal apenas.** Baixar conteúdo de plataformas pode violar seus Termos de Serviço. Use com responsabilidade.

---

## Plataformas suportadas

| Plataforma  | URLs aceitas |
|-------------|-------------|
| YouTube     | `youtube.com`, `youtu.be`, `m.youtube.com` |
| TikTok      | `tiktok.com`, `vm.tiktok.com`, `vt.tiktok.com` |
| Instagram   | `instagram.com` (conteúdo público) |

---

## Tecnologias

- **[Next.js 15](https://nextjs.org/)** — framework React com App Router e API Routes nativas
- **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** — motor de download (roda localmente na sua máquina)
- **TypeScript** — tipagem end-to-end
- **CSS Modules** — estilos escopados por componente

---

## Pré-requisitos

### Node.js 18+

```bash
node -v
```

Caso não tenha, baixe em [nodejs.org](https://nodejs.org/).

### yt-dlp

O `yt-dlp` é o único binário externo necessário. Ele deve estar disponível no PATH do sistema.

```bash
# Manjaro / Arch Linux
sudo pacman -S yt-dlp

# Ubuntu / Debian
sudo apt install yt-dlp

# macOS (Homebrew)
brew install yt-dlp

# Via pip (qualquer sistema)
pip install yt-dlp

# Verificar instalação
yt-dlp --version
```

---

## Instalação

```bash
# 1. Clone o repositório
git clone <url-do-repo>
cd download-song

# 2. Instale as dependências Node
npm install
```

---

## Como usar

### Modo desenvolvimento

```bash
npm run dev
```

Acesse **[http://localhost:3000](http://localhost:3000)** no navegador.

### Modo produção

```bash
npm run build
npm start
```

---

## Passo a passo dentro do app

**1. Cole a URL do vídeo**

No campo de busca, cole o link da plataforma desejada. Exemplos:

```
# YouTube
https://www.youtube.com/watch?v=XXXXXXXXXXX
https://youtu.be/XXXXXXXXXXX

# TikTok
https://www.tiktok.com/@usuario/video/XXXXXXXXXXX
https://vt.tiktok.com/XXXXXXX/

# Instagram
https://www.instagram.com/reel/XXXXXXXXXXX/
https://www.instagram.com/p/XXXXXXXXXXX/
```

**2. Clique em "Buscar"**

O servidor consulta o `yt-dlp` e retorna as informações do vídeo: título, canal, duração e todos os formatos disponíveis. Caso algo dê errado, a mensagem de erro exata do `yt-dlp` é exibida na tela.

**3. Escolha o formato**

A lista exibe as opções disponíveis com resolução, extensão e tamanho estimado. Exemplos típicos:

| Tipo  | Resolução | Extensão |
|-------|-----------|----------|
| Vídeo | 1080p     | .mp4     |
| Vídeo | 720p      | .mp4     |
| Vídeo | 480p      | .webm    |
| Áudio | audio     | .m4a     |

**4. Clique em "Baixar"**

O progresso aparece em tempo real no log integrado. Quando terminar, um link **"Salvar arquivo"** aparece para baixar o arquivo para o seu computador.

> O arquivo é processado na pasta `/tmp` do sistema e deletado automaticamente após o download.

---

## Estrutura do projeto

```
src/
├── types.ts                        # Interfaces TypeScript compartilhadas
├── lib/
│   └── validate.ts                 # Validação de URLs por plataforma
├── app/
│   ├── layout.tsx                  # Layout raiz (HTML, metadata)
│   ├── globals.css                 # Variáveis CSS e reset global
│   ├── icon.svg                    # Favicon
│   ├── page.tsx                    # Página principal (estado e orquestração)
│   ├── page.module.css
│   └── api/
│       ├── info/route.ts           # POST  /api/info     — busca metadados do vídeo
│       ├── download/route.ts       # GET   /api/download — SSE de progresso
│       └── file/route.ts           # GET   /api/file     — serve e deleta o arquivo
└── components/
    ├── SearchForm.tsx              # Formulário de busca
    ├── VideoCard.tsx               # Card com thumbnail e informações
    ├── FormatList.tsx              # Lista de formatos disponíveis
    └── DownloadProgress.tsx        # Barra de progresso e log em tempo real
```

---

## Como funciona por baixo dos panos

```
Navegador
  │
  ├─ POST /api/info
  │     └─ yt-dlp --dump-json <url>
  │           └─ retorna título, thumbnail, duração e formatos
  │
  ├─ GET /api/download  (Server-Sent Events)
  │     └─ yt-dlp -f <format_id> -o /tmp/...
  │           └─ progresso transmitido linha a linha em tempo real
  │
  └─ GET /api/file?path=...
        └─ Node.js lê o arquivo de /tmp e envia para o navegador
              └─ arquivo deletado do servidor após o download
```

O `yt-dlp` roda como processo filho do Node.js. Se o navegador fechar ou cancelar a requisição, o processo é encerrado automaticamente via `AbortSignal`.

---

## Solução de problemas

**"yt-dlp não encontrado"**
- Instale o yt-dlp conforme as instruções em [Pré-requisitos](#pré-requisitos)

**Erro ao buscar vídeo do TikTok ou Instagram**
- Atualize o yt-dlp para a versão mais recente: `yt-dlp -U`
- Teste diretamente no terminal para ver o erro completo:
  ```bash
  yt-dlp --dump-json "<url>"
  ```

**Vídeo baixa sem áudio**
- Alguns formatos contêm apenas vídeo ou apenas áudio. Escolha um formato `.mp4` combinado ou use a opção padrão (melhor qualidade disponível)

**Instagram: "login required"**
- Perfis privados e Stories exigem autenticação. Apenas conteúdo público é suportado sem login

**Erro de permissão no `/tmp`**
- Verifique se o usuário tem permissão de escrita em `/tmp`

---

## Licença

MIT

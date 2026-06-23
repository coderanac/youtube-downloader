# YT Downloader

Aplicação web para baixar vídeos do YouTube diretamente pelo navegador. Você cola a URL, escolhe o formato e a qualidade, e o arquivo é baixado para o seu computador.

> **Uso pessoal apenas.** Baixar conteúdo do YouTube pode violar os [Termos de Serviço](https://www.youtube.com/static?template=terms) da plataforma. Use com responsabilidade.

---

## Tecnologias

- **[Next.js 15](https://nextjs.org/)** — framework React com App Router e API Routes nativas
- **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** — motor de download (roda localmente na sua máquina)
- **TypeScript** — tipagem end-to-end
- **CSS Modules** — estilos escopados por componente

---

## Pré-requisitos

Antes de rodar o projeto, instale:

### Node.js 18+

```bash
# Verificar versão instalada
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

No campo de busca, cole o link do YouTube que deseja baixar. Formatos aceitos:

```
https://www.youtube.com/watch?v=XXXXXXXXXXX
https://youtu.be/XXXXXXXXXXX
https://m.youtube.com/watch?v=XXXXXXXXXXX
```

**2. Clique em "Buscar"**

O servidor consulta o `yt-dlp` e retorna as informações do vídeo: título, canal, duração e todos os formatos disponíveis.

**3. Escolha o formato**

A lista exibe as opções disponíveis com resolução, extensão e tamanho estimado. Exemplos típicos:

| Tipo  | Resolução | Extensão |
|-------|-----------|----------|
| Vídeo | 1080p     | .mp4     |
| Vídeo | 720p      | .mp4     |
| Vídeo | 480p      | .webm    |
| Áudio | audio     | .m4a     |

**4. Clique em "Baixar"**

O progresso aparece em tempo real no terminal integrado. Quando terminar, um link **"Salvar arquivo"** aparece para você baixar o arquivo para o seu computador.

> O arquivo é processado na pasta `/tmp` do sistema e deletado automaticamente após o download.

---

## Estrutura do projeto

```
src/
├── types.ts                        # Interfaces TypeScript compartilhadas
├── app/
│   ├── layout.tsx                  # Layout raiz (HTML, metadata)
│   ├── globals.css                 # Variáveis CSS e reset global
│   ├── icon.svg                    # Favicon
│   ├── page.tsx                    # Página principal (estado e orquestração)
│   ├── page.module.css
│   └── api/
│       ├── info/route.ts           # POST  /api/info    — busca metadados do vídeo
│       ├── download/route.ts       # GET   /api/download — SSE de progresso
│       └── file/route.ts           # GET   /api/file    — serve e deleta o arquivo
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

**"Não foi possível obter informações do vídeo"**
- Verifique se o `yt-dlp` está instalado: `yt-dlp --version`
- Atualize o yt-dlp: `yt-dlp -U`
- Vídeos com restrição de idade ou privados não são suportados

**Vídeo baixa sem áudio**
- Alguns formatos contêm apenas vídeo ou apenas áudio. Escolha um formato `.mp4` com resolução + áudio combinados, ou selecione "bestvideo+bestaudio" (padrão quando nenhum formato é escolhido)

**Erro de permissão no `/tmp`**
- Verifique se o usuário tem permissão de escrita em `/tmp`

---

## Licença

MIT

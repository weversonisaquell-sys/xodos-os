# XodosOS

Emulador de desktop (interface estilo Windows/Linux) rodando no navegador, com cursor "trackpad" customizado para touch.

## Arquivos
- `windows.html` — estrutura da interface (janelas, taskbar, menu iniciar)
- `style.css` — visual e tema
- `mouse.js` — lógica do cursor virtual (toque vira trackpad)

## Build do APK
O APK é gerado automaticamente via GitHub Actions a cada push na branch `main`.
Baixe o resultado em **Actions → último workflow → Artifacts → xodos-os-apk**.

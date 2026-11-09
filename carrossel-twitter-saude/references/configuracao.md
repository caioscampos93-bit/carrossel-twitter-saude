# Configuração e execução

## Conteúdo

O JSON de entrada aceita:

```json
{
  "title": "5 erros ao voltar a treinar",
  "caption": "Texto da legenda, com parágrafos separados por \\n\\n.",
  "slides": [
    {"type": "cover", "title": "5 erros ao voltar\na treinar."},
    {"type": "content", "title": "1. Voltar com a mesma\ncarga de antes.", "body": "Texto curto que explica o erro."},
    {"type": "closing", "title": "Seu retorno merece\num plano.", "body": "Me chama no direct."}
  ]
}
```

Tipos: `cover`, `content`, `closing`. O gerador aceita 3–12 slides. `body` é opcional; `title` é obrigatório. Use texto simples: `<br>` não é interpretado como marcação. O campo `caption` deve trazer a legenda final; os scripts não escrevem conteúdo usando uma API.

O exemplo completo de sete slides está em `assets/exemplo-5-erros.json`. O tema é apenas exemplo: para um novo pedido, escreva um novo JSON.

## Outra marca

Acrescente `brand` ao JSON para substituir somente os campos desejados:

```json
{
  "brand": {
    "displayName": "Nome - Especialidade",
    "handle": "@perfil",
    "background": "#0C2037",
    "logo": "marca/logo-transparente.png",
    "portrait": "marca/foto.jpg",
    "portraitMode": "image"
  }
}
```

Os caminhos personalizados são relativos ao JSON de entrada. Os caminhos de `assets/brand.json` são relativos a `assets/` da skill. Imagens são incorporadas ao HTML; o arquivo final não depende dos caminhos originais. O conteúdo exportado também conserva os assets para reprodução. Ao mudar `displayName` ou `handle`, o gerador remove logo e foto do Gabriel que não tenham sido fornecidas explicitamente para a nova identidade. Sem foto, usa iniciais; `logo: null` e `portrait: null` também são aceitos.

`portraitMode: "instagram-screenshot"` é específico da captura original do Gabriel (1002×321): o CSS enquadra a foto circular sem expor o restante do perfil. Para uma foto normal, use `image`. Não use o enquadramento fixo em outra captura. Para reutilização frequente por outra pessoa, substitua `assets/brand.json` e seus assets na cópia dela.

Os arquivos de marca do Gabriel são referências próprias do usuário, não uma biblioteca de marcas para terceiros. Ao repassar o formato a outro profissional, peça a identidade dele e substitua o preset.

## Dependências

- `generate.cjs`: Node.js, sem dependências externas.
- `render.cjs`: Node.js, pacote `playwright` e um Chromium/Chrome/Edge compatível. Veja `--help` para opções de navegador.
- Fontes: `assets/fonts.css` contém a Inter; licença em `assets/INTER-LICENSE.txt`. Nenhuma chamada de imagem ou IA paga é necessária para reutilizar os assets existentes.

Descubra as dependências instaladas antes de sugerir instalação. Quando necessário e autorizado, prepare Node.js/Playwright pelo gerenciador oficial do ambiente. Não incorpore `node_modules` ou executáveis de navegador ao ZIP de compartilhamento.

Para usar Playwright de uma pasta existente:

```powershell
$env:NODE_PATH = "C:\caminho\do\runtime\node_modules"
node "C:\caminho\da\skill\scripts\generate.cjs" --input "C:\projeto\conteudo.json" --output "C:\projeto\outputs\tema"
node "C:\caminho\da\skill\scripts\render.cjs" --input "C:\projeto\outputs\tema\carrossel.html"
```

Os caminhos acima são exemplos a substituir. Não dependem de nomes de usuário nem pastas do chat original. Em macOS/Linux use os equivalentes da shell local.

## Revisões e entrega

Prefira uma nova pasta para versões alternativas. Para substituir uma geração ou exportação autorizada, use `--force` no gerador e no renderizador conforme a etapa; nunca aponte a saída para a própria skill ou seus assets. O render não deve corrigir silenciosamente conteúdo longo: reduza o texto, redistribua slides ou ajuste o template por decisão editorial.

A legenda não é inserida dentro das artes. `referencias.md`, quando necessário, acompanha a entrega sem virar mais um bloco de texto nos slides.

O roteiro de exemplo foi revisado com as fontes em [fontes-exemplo.md](fontes-exemplo.md). Elas fundamentam aquele tema; consulte fontes pertinentes ao criar temas novos.

---
name: carrossel-twitter-saude
description: "Cria carrosséis de saúde, exercício e bem-estar em estilo Twitter, com texto de opinião, identidade configurável, HTML editável, PNGs e legenda. Inclui o visual aprovado de Gabriel Arouck. Use para esse formato de post social, não para publicar no Twitter."
---

# Carrossel Twitter de saúde

Produza carrosséis no formato aprovado: cartão branco de post sobre azul-marinho, foto circular, nome, @, logo transparente visível e texto direto. O preset é **Gabriel Arouck - Personal Trainer**, **@garouck**. As escolhas explícitas do usuário prevalecem sobre os padrões desta skill.

## Briefing e texto

- Use tema, público, quantidade e intenção informados. Se só faltar um tema que não possa ser inferido, pergunte. Não peça novamente logo ou foto do preset.
- Por padrão, escreva em português brasileiro para pessoas que precisam encaixar o treino na rotina. Para “5 erros”, use capa + um slide por erro + convite final: sete slides. Outros temas podem ter outra quantidade; o gerador aceita 3–12.
- Cada slide interno tem uma ideia principal e um parágrafo curto. Escreva uma opinião concreta e explicação útil, sem repetir “na minha opinião” em todos os slides. Use primeira pessoa como voz editorial proposta, sem inventar experiências, resultados ou depoimentos.
- Não inclua blocos “Meu ponto”, “Minha régua”, resumos redundantes, slogans de rodapé ou frases decorativas abaixo do conteúdo. A capa não precisa de subtítulo. No final, basta um convite claro, como “Me chama no direct”.
- Preserve o conteúdo ao fazer só uma alteração visual. Para mudanças de texto, siga o pedido e mantenha uma ideia por slide.
- Para orientações de saúde/exercício, verifique alegações materiais em fontes primárias confiáveis quando necessário e registre os links em `referencias.md`. Não transforme opinião em prescrição individual nem invente números, garantias ou contraindicações. Evite inserir avisos genéricos nas artes sem necessidade.
- Gere também uma legenda coerente com o texto, em voz natural, com um convite principal e hashtags pertinentes. Não force um número de hashtags nem repita literalmente todos os slides.

## Visual aprovado

- Slides de **1080 × 1350 px**. O mesmo fundo ao longo do carrossel faz parte deste estilo.
- Fundo **#0C2037**, ondas azuis sutis, cartão branco arredondado. Logo branca transparente no topo esquerdo, com caixa aproximada de **320 × 165 px**; contador no topo direito.
- Foto circular, **Gabriel Arouck - Personal Trainer**, **@garouck**, texto preto e ícones sociais discretos sem métricas. Não acrescente selo de verificação nem data de publicação fictícia.
- Tipografia Inter incorporada. Mantenha texto legível no celular; encurte ou redistribua conteúdo antes de reduzir o corpo abaixo de 36 px.
- Os ícones são elementos do layout. A entrega é uma arte inspirada em posts, não prova de publicação real.

Os arquivos em `assets/` são autocontidos. `assets/brand.json` define o preset; `assets/exemplo-5-erros.json` contém o exemplo desta conversa. Para outra marca ou para entender o JSON, leia [references/configuracao.md](references/configuracao.md). Não altere os assets padrão ao personalizar uma única entrega; use o campo `brand` no JSON do projeto.

## Produção

1. Escreva o conteúdo em um JSON na pasta de trabalho do projeto. Use texto simples, com `\n` para quebras intencionais, sem HTML. Consulte o exemplo e a referência de configuração.
2. Resolva os caminhos de scripts a partir desta skill. Salve entregas em `outputs/<tema>/` do projeto, ou no destino pedido; nunca na pasta instalada da skill.
3. Gere o HTML e os textos:

   ```text
   node <skill>/scripts/generate.cjs --input <conteudo.json> --output <destino>
   ```

4. Renderize os PNGs:

   ```text
   node <skill>/scripts/render.cjs --input <destino>/carrossel.html
   ```

   No PowerShell, coloque caminhos entre aspas. Primeiro descubra Node.js/Playwright já disponíveis; no Codex desktop, `load_workspace_dependencies` pode informar o runtime. `NODE_PATH` pode apontar para os módulos existentes. Não copie caminhos da máquina de origem. O HTML abre offline; a exportação precisa de Node.js, Playwright e um navegador compatível.

5. Se faltarem dependências ou houver bloqueio de execução, descreva o impedimento concreto e siga as permissões do ambiente. Os scripts não instalam software, não acessam redes sociais e não publicam.
6. O gerador protege arquivos existentes: use novo destino para uma variação; `--force` somente quando a revisão autorizar substituir arquivos. O renderizador acusa conteúdo que não cabe. Corrija o texto/layout e exporte de novo; não entregue cortes.
7. Inspecione `visao-geral.png` e ao menos capa, um erro e CTA em tamanho legível. Confira identidade, contraste, acentos, logo sem tarja, numeração, ausência de cortes e sobreposição. A checagem automática complementa a inspeção visual.
8. Entregue PNGs numerados, `carrossel.html`, `render.js`, `conteudo.json`, `texto.md`, `legenda.md`, prévias e referências usadas. Empacote em ZIP quando facilitar o download. Mostre a prévia e os links; não publique o conteúdo sem pedido.

## Recursos

- [references/configuracao.md](references/configuracao.md): esquema, personalização e execução portátil.
- `assets/brand.json`: identidade padrão do Gabriel.
- `assets/exemplo-5-erros.json`: conteúdo de exemplo reutilizável, não tema obrigatório.
- `assets/template.css` e `assets/fonts.css`: visual e fonte incorporada.
- `assets/gabriel/`: logo transparente e captura de perfil fornecidas pelo usuário. A captura é enquadrada pelo layout; nenhum rosto é recriado.

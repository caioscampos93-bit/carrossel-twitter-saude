# Carrossel Twitter — Saúde

Este pacote transforma o formato aprovado do Gabriel Arouck em uma skill reutilizável. Ela cria roteiro, HTML editável, PNGs 1080×1350, prévias e legenda. O gerador foi testado com os sete slides do Gabriel e com outra identidade.

## Como usar

Em um novo chat do Codex, escreva:

```text
Use $carrossel-twitter-saude para criar um carrossel de 7 slides sobre 5 erros de quem começa na musculação, em tom de opinião. Use a identidade do Gabriel e entregue os PNGs e a legenda.
```

Ou peça uma mudança localizada:

```text
Use $carrossel-twitter-saude. Faça um carrossel de 5 slides sobre constância no treino. Mantenha azul-marinho, logo grande sem tarja e texto direto, sem frases extras no rodapé.
```

## Como repassar a outra pessoa

1. Envie o **ZIP completo** por WhatsApp, e-mail, Drive ou outro meio de sua preferência. O envio é feito por você; este pacote não publica nem envia arquivos automaticamente.
2. A pessoa descompacta e copia a pasta **carrossel-twitter-saude inteira** para sua pasta pessoal de skills:
   - Windows: `%USERPROFILE%\.agents\skills\`
   - macOS/Linux: `~/.agents/skills/`
3. O arquivo deve ficar em `.../skills/carrossel-twitter-saude/SKILL.md`, acompanhado de `agents`, `assets`, `references` e `scripts`. Não envie apenas o SKILL.md e não deixe uma pasta extra entre `skills` e `carrossel-twitter-saude`.
4. Abra um novo chat. Se a skill não aparecer, reinicie o Codex. Use `$carrossel-twitter-saude` no pedido.

A documentação oficial descreve descoberta em `.agents/skills`, uso da pasta da skill e reinício quando alterações não aparecem: [Build skills — OpenAI](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills). Algumas instalações existentes usam `$CODEX_HOME/skills`; evite manter duas cópias com o mesmo nome em locais diferentes.

## Mensagem pronta para acompanhar o ZIP

> Estou te enviando uma skill para criar carrosséis de saúde e treino no estilo Twitter. Descompacte o ZIP e copie a pasta carrossel-twitter-saude inteira para a pasta .agents/skills do seu usuário. Depois abra um novo chat do Codex e peça: “Use $carrossel-twitter-saude para criar um carrossel sobre [tema]”. O pacote já inclui o modelo visual, a logo e a foto do Gabriel. Para usar com outra marca, peça ao Codex para trocar nome, @, foto e logo.

## Para usar com outra pessoa ou marca

O pacote inclui a **logo e a captura de perfil do Gabriel**, além do exemplo original. Para outro profissional, informe os dados e assets dele:

```text
Use $carrossel-twitter-saude para um carrossel sobre [tema]. A marca é [nome e profissão], o perfil é [@perfil]. Use a foto e a logo que enviei. Não use a identidade do Gabriel.
```

O preset pode ser personalizado em `assets/brand.json`, ou por pedido usando o campo `brand` no conteúdo. As instruções estão em `carrossel-twitter-saude/references/configuracao.md`. Sem foto ou logo da nova pessoa, o gerador usa iniciais e omite a logo.

## O que precisa estar disponível

O HTML funciona offline. Para gerar PNGs, o computador precisa de Node.js, Playwright e um navegador compatível. O Codex deve verificar primeiro se esses componentes já existem no ambiente. O ZIP não inclui runtimes, `node_modules`, chaves de API ou logins. Não exige conta no Twitter nem uma API de geração de imagem para reutilizar o layout.

A fonte Inter acompanha a licença em `assets/INTER-LICENSE.txt`. Logo e foto são os materiais fornecidos para este projeto; substitua-os quando o pacote for usado para outra identidade.

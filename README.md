# Viso — assets da marca

Repositório público **apenas com imagens do logo** do Viso. Existe porque
clientes de e-mail e o iOS precisam de uma URL pública e estável para
renderizar imagens, e o repositório do aplicativo é privado.

Nenhum código do aplicativo vive aqui.

| Arquivo | Uso |
|---|---|
| `email-logo.png` | Símbolo em creme, fundo transparente — cabeçalho dos e-mails transacionais |
| `apple-touch-icon-180.png` | Ícone da tela de início no iPhone |
| `apple-touch-icon-167.png` | Ícone da tela de início no iPad Pro |
| `apple-touch-icon-152.png` | Ícone da tela de início no iPad / iPad mini |
| `og-card.png` | 1200×630 — cartão de compartilhamento (Open Graph) do app e da landing |
| `favicon.ico` | 16→180px — ícone de aba; subir pelo painel da Skip, que serve `/favicon.ico` |

**Importante:** as referências a estes arquivos usam a URL fixada pelo SHA do
commit (`raw.githubusercontent.com/.../<sha>/arquivo.png`), nunca `main`.
Trocar um logo significa novo commit **e** atualizar as URLs que o apontam.

## Por que o `og-card.png` mora aqui

Projetos Skip só aceitam arquivo de TEXTO pelas ferramentas de escrita, então
não há como versionar um PNG dentro do app. O `public/og-image.png` que a
plataforma serve vinha com a arte de divulgação do próprio Skip — em toda
mensagem com o link, o preview anunciava outro produto.

Servir daqui resolve duas coisas de uma vez: a imagem passa a ser da marca, e
a `og:image` deixa de ser caminho relativo (`/og-image.png`) e vira URL
absoluta, que é o que os raspadores de rede social exigem.

O cartão traz o nome **Viso** escrito. Se a marca mudar, ele é refeito.

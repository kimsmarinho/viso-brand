# SWallet — assets da marca

Repositório público que existe porque clientes de e-mail e o iOS precisam de uma
URL pública e estável, e o repositório do aplicativo é privado.

Nenhum código do aplicativo vive aqui.

| Arquivo | Uso |
|---|---|
| `email-logo.png` | 130×180 — cabeçalho dos e-mails transacionais do painel da Skip (verificação, redefinição de senha, troca de e-mail, OTP). Exibir em `width="43" height="60"` |
| `apple-touch-icon-180.png` | Ícone da tela de início no iPhone |
| `apple-touch-icon-167.png` | Ícone da tela de início no iPad Pro |
| `apple-touch-icon-152.png` | Ícone da tela de início no iPad / iPad mini |
| `pda-049-tabela_22_procedimentos_e_eventos_em_saude.csv` | **Não é marca.** Ver abaixo — é o arquivo que não se apaga |

**As referências usam a URL fixada pelo SHA do commit**
(`raw.githubusercontent.com/.../<sha>/arquivo`), nunca `main`. Trocar um arquivo
significa novo commit **e** atualizar as URLs que o apontam — trocar aqui, sozinho,
não muda nada no que está no ar.

O nome do repositório é `viso-brand` e **fica assim**, apesar de a marca ser SWallet:
renomear derruba todas as URLs fixadas, inclusive a do CSV abaixo. Ver
`tests/renomear-intocaveis.test.mjs` no repositório do app.

## O CSV da TUSS — o arquivo que não se apaga

`pda-049-tabela_22_procedimentos_e_eventos_em_saude.csv` é o CSV oficial da ANS,
tabela 22 do pacote PDA-049 (551.833 bytes, sha256 `c0782d1e…`). O cron
`carregar_tuss_descricoes.js` baixa dele as **5.966 descrições** que são a base do
autocompletar inteiro, desde que a migração 0053 removeu a semente `tuss_codes`.

Se ele sumir, o hook **não lança exceção — só registra erro no log**. O
autocompletar para de oferecer código, em silêncio, e nada liga uma coisa à outra.

## O que saiu em 13/09/2026

`og-card.png` e `favicon.ico` foram removidos. Os dois ainda traziam a arte da marca
Viso e nada mais os referenciava:

- o `og:image` do app voltou a ser servido pelo próprio domínio
  (`surgipay-saas-18a56.goskip.app/og-image.png`), em URL absoluta — a razão de o
  cartão morar aqui era que a plataforma servia a arte de divulgação da própria
  Skip naquele caminho, e isso deixou de ser verdade;
- o favicon é servido por `public/favicon.ico` do app, subido pelo painel.

O `email-logo.png` foi **trocado** em vez de removido: os quatro modelos de e-mail
dependem dele. Como eles fixam um SHA antigo, continuam mostrando a logo Viso até
que as URLs sejam atualizadas.

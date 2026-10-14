// ans/gerar.mjs — gera ans/operadoras.tsv e ans/atual.json a partir da lista oficial de
// operadoras ativas da ANS (dados abertos, Relatorio_cadop.csv).
// Fonte: https://dadosabertos.ans.gov.br/FTP/PDA/operadoras_de_plano_de_saude_ativas/
// Cada linha do TSV: registro ANS (6 dígitos) \t nome fantasia (ou a razão social, quando a
// operadora não tem fantasia) \t razão social. União com a tabela anterior: a operadora que
// sai da lista de ativas continua, porque a guia antiga dela continua existindo.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export function ck(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0
  return h
}

// CSV de ponto e vírgula com aspas (aspas dobradas dentro do campo).
function lerCsv(texto) {
  const linhas = []
  let campo = ''
  let linha = []
  let aspas = false
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') {
        campo += '"'
        i++
      } else if (c === '"') aspas = false
      else campo += c
    } else if (c === '"') aspas = true
    else if (c === ';') {
      linha.push(campo)
      campo = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++
      linha.push(campo)
      linhas.push(linha)
      linha = []
      campo = ''
    } else campo += c
  }
  if (campo !== '' || linha.length) {
    linha.push(campo)
    linhas.push(linha)
  }
  return linhas
}

const limpar = (s) => String(s || '').replace(/\s+/g, ' ').trim()

export function gerar(csv, tsvAnterior) {
  const linhas = lerCsv(String(csv).replace(/^﻿/, ''))
  const cab = (linhas.shift() || []).map((c) => c.trim())
  const iReg = cab.indexOf('REGISTRO_OPERADORA')
  const iRazao = cab.indexOf('RAZAO_SOCIAL')
  const iFantasia = cab.indexOf('NOME_FANTASIA')
  if (iReg < 0 || iRazao < 0 || iFantasia < 0) {
    throw new Error('cabeçalho da ANS mudou: ' + cab.slice(0, 5).join(';'))
  }
  const mapa = new Map()
  for (const l of String(tsvAnterior || '').split('\n')) {
    const p = l.split('\t')
    if (p.length === 3 && /^\d{6}$/.test(p[0])) mapa.set(p[0], [p[1], p[2]])
  }
  let ativas = 0
  for (const l of linhas) {
    const reg = limpar(l[iReg])
    const razao = limpar(l[iRazao])
    if (!/^\d{6}$/.test(reg) || !razao) continue
    mapa.set(reg, [limpar(l[iFantasia]) || razao, razao])
    ativas++
  }
  const registros = [...mapa.keys()].sort()
  const tsv = registros.map((r) => r + '\t' + mapa.get(r).join('\t') + '\n').join('')
  const blob = '\n' + tsv
  return {
    tsv,
    manifesto: {
      arquivo: 'ans/operadoras.tsv',
      linhas: registros.length,
      ativas,
      tamanho: blob.length,
      ck: ck(blob),
    },
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const anterior = existsSync('ans/operadoras.tsv') ? readFileSync('ans/operadoras.tsv', 'utf8') : ''
  const r = gerar(readFileSync(process.argv[2], 'utf8'), anterior)
  if (r.manifesto.ativas < 500) {
    console.error('menos de 500 operadoras ativas; nada gravado', r.manifesto)
    process.exit(1)
  }
  writeFileSync('ans/operadoras.tsv', r.tsv)
  writeFileSync('ans/atual.json', JSON.stringify(r.manifesto, null, 2) + '\n')
  console.log(r.manifesto)
}

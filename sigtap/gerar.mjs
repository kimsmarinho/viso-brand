// sigtap/gerar.mjs — gera sigtap/sigtap.tsv e sigtap/atual.json a partir dos zips oficiais do DATASUS.
// Fonte: ftp://ftp2.datasus.gov.br/pub/sistemas/tup/downloads/ (CC BY 3.0, Ministério da Saúde).
// tb_procedimento.txt: largura fixa, latin1, CRLF; código nas colunas 1–10, nome 11–260, competência 331–336.
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export function ck(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0
  return h
}

function lerZip(caminho) {
  const bruto = execFileSync('unzip', ['-p', caminho, 'tb_procedimento.txt'], { maxBuffer: 64 * 1024 * 1024 })
  const pares = []
  let competencia = ''
  for (const l of bruto.toString('latin1').split(/\r?\n/)) {
    const cod = l.slice(0, 10)
    const nome = l.slice(10, 260).replace(/[\t\r\n]+/g, ' ').trim()
    if (!/^\d{10}$/.test(cod) || !nome) continue
    pares.push([cod, nome])
    const c = l.slice(330, 336)
    if (/^\d{6}$/.test(c) && c > competencia) competencia = c
  }
  return { pares, competencia }
}

export function gerar(zips, tsvAnterior) {
  const mapa = new Map()
  for (const l of String(tsvAnterior || '').split('\n')) {
    const i = l.indexOf('\t')
    if (i === 10 && /^\d{10}$/.test(l.slice(0, 10))) mapa.set(l.slice(0, 10), l.slice(11))
  }
  let competencia = ''
  let vigentes = 0
  for (const z of zips) {
    const r = lerZip(z)
    for (const [c, n] of r.pares) mapa.set(c, n)
    if (r.competencia > competencia) { competencia = r.competencia; vigentes = r.pares.length }
  }
  const codigos = [...mapa.keys()].sort()
  const tsv = codigos.map((c) => c + '\t' + mapa.get(c) + '\n').join('')
  const blob = '\n' + tsv
  return {
    tsv,
    manifesto: { competencia, arquivo: 'sigtap/sigtap.tsv', linhas: codigos.length, vigentes, tamanho: blob.length, ck: ck(blob) },
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const anterior = existsSync('sigtap/sigtap.tsv') ? readFileSync('sigtap/sigtap.tsv', 'utf8') : ''
  const r = gerar(process.argv.slice(2), anterior)
  if (r.manifesto.linhas < 5000) { console.error('menos de 5000 códigos; nada gravado', r.manifesto); process.exit(1) }
  writeFileSync('sigtap/sigtap.tsv', r.tsv)
  writeFileSync('sigtap/atual.json', JSON.stringify(r.manifesto, null, 2) + '\n')
  console.log(r.manifesto)
}

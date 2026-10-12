// sigtap/gerar.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'
import { gerar, ck } from './gerar.mjs'

function linha(cod, nome, comp) {
  return (cod + nome.padEnd(250, ' ')).padEnd(330, ' ') + comp
}
function zipCom(dir, nome, linhas) {
  const txt = join(dir, 'tb_procedimento.txt')
  writeFileSync(txt, Buffer.from(linhas.join('\r\n') + '\r\n', 'latin1'))
  const z = join(dir, nome)
  execFileSync('zip', ['-j', '-q', z, txt])
  return z
}

test('união: código que saiu continua, nome vem da competência mais nova', () => {
  const d = mkdtempSync(join(tmpdir(), 'sigtap-'))
  const z1 = zipCom(d, 'TabelaUnificada_202608_v1.zip', [
    linha('0407030026', 'COLECISTECTOMIA ANTIGA', '202608'),
    linha('0303170077', 'TRATAMENTO REVOGADO', '202608'),
  ])
  const z2 = zipCom(d, 'TabelaUnificada_202609_v2.zip', [
    linha('0407030026', 'COLECISTECTOMIA', '202609'),
    linha('0402010043', 'TIREOIDECTOMIA TOTAL', '202609'),
  ])
  const r = gerar([z1, z2], '')
  assert.equal(r.manifesto.competencia, '202609')
  assert.equal(r.manifesto.linhas, 3)
  assert.equal(r.manifesto.vigentes, 2)
  assert.equal(r.tsv,
    '0303170077\tTRATAMENTO REVOGADO\n0402010043\tTIREOIDECTOMIA TOTAL\n0407030026\tCOLECISTECTOMIA\n')
  assert.equal(r.manifesto.tamanho, ('\n' + r.tsv).length)
  assert.equal(r.manifesto.ck, ck('\n' + r.tsv))
})

test('acento latin1 vira UTF-8 e a base anterior é preservada', () => {
  const d = mkdtempSync(join(tmpdir(), 'sigtap-'))
  const z = zipCom(d, 'TabelaUnificada_202610_v1.zip', [linha('0101010010', 'ORIENTAÇÃO EM GRUPO', '202610')])
  const r = gerar([z], '0407030026\tCOLECISTECTOMIA\n')
  assert.match(r.tsv, /0101010010\tORIENTAÇÃO EM GRUPO\n/)
  assert.match(r.tsv, /0407030026\tCOLECISTECTOMIA\n/)
})

test('linha fora do formato não entra', () => {
  const d = mkdtempSync(join(tmpdir(), 'sigtap-'))
  const z = zipCom(d, 'TabelaUnificada_202610_v1.zip', ['ABC', linha('040703002X', 'LIXO', '202610')])
  assert.equal(gerar([z], '').manifesto.linhas, 0)
})

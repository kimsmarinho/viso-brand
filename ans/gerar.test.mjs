// ans/gerar.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { gerar, ck } from './gerar.mjs'

const CAB =
  'REGISTRO_OPERADORA;CNPJ;RAZAO_SOCIAL;NOME_FANTASIA;MODALIDADE;LOGRADOURO;NUMERO;COMPLEMENTO;BAIRRO;CIDADE;UF;CEP;DDD;TELEFONE;FAX;ENDERECO_ELETRONICO;REPRESENTANTE;CARGO_REPRESENTANTE;REGIAO_DE_COMERCIALIZACAO;DATA_REGISTRO_ANS'
function linha(reg, razao, fantasia) {
  const f = fantasia === null ? '' : `"${fantasia}"`
  return `"${reg}";"00000000000100";"${razao}";${f};"Medicina de Grupo";"RUA X";"1";;"CENTRO";"Cidade";"MS";"79000000";"67";"0";;"a@b.c";"Fulano";"DIRETOR";4;"2000-01-01"`
}

test('registro, nome fantasia e razão social; sem fantasia, o nome é a razão social', () => {
  const csv = [
    CAB,
    linha('123456', 'OPERADORA EXEMPLO DE TESTE LTDA', 'EXEMPLO SAÚDE'),
    linha('654321', 'OUTRA OPERADORA DE TESTE S.A.', null),
  ].join('\r\n')
  const r = gerar(csv, '')
  assert.equal(
    r.tsv,
    '123456\tEXEMPLO SAÚDE\tOPERADORA EXEMPLO DE TESTE LTDA\n' +
      '654321\tOUTRA OPERADORA DE TESTE S.A.\tOUTRA OPERADORA DE TESTE S.A.\n',
  )
  assert.equal(r.manifesto.linhas, 2)
  assert.equal(r.manifesto.ativas, 2)
  assert.equal(r.manifesto.arquivo, 'ans/operadoras.tsv')
  assert.equal(r.manifesto.tamanho, ('\n' + r.tsv).length)
  assert.equal(r.manifesto.ck, ck('\n' + r.tsv))
})

test('união: a operadora que saiu da lista de ativas continua; o nome vem da lista nova', () => {
  const anterior = '111111\tCANCELADA SAÚDE\tCANCELADA LTDA\n123456\tNOME ANTIGO\tRAZAO ANTIGA\n'
  const csv = [CAB, linha('123456', 'RAZAO NOVA LTDA', 'NOME NOVO')].join('\n')
  const r = gerar(csv, anterior)
  assert.equal(r.tsv, '111111\tCANCELADA SAÚDE\tCANCELADA LTDA\n123456\tNOME NOVO\tRAZAO NOVA LTDA\n')
  assert.equal(r.manifesto.linhas, 2)
  assert.equal(r.manifesto.ativas, 1)
})

test('aspas dobradas, ponto e vírgula dentro de aspas, tabulação e espaço sobrando', () => {
  const csv = [CAB, linha('222222', 'ASSOCIAÇÃO ""BOA""; SAÚDE\tLTDA', '  BOA  SAÚDE ')].join('\n')
  const r = gerar(csv, '')
  assert.equal(r.tsv, '222222\tBOA SAÚDE\tASSOCIAÇÃO "BOA"; SAÚDE LTDA\n')
})

test('linha sem registro de 6 dígitos fica de fora', () => {
  const csv = [CAB, linha('12345', 'CURTA', 'X'), linha('ABCDEF', 'LETRAS', 'Y')].join('\n')
  assert.equal(gerar(csv, '').manifesto.linhas, 0)
})

test('cabeçalho mudou de nome: recusa em vez de gravar coluna errada', () => {
  const csv = ['REG;CNPJ;RAZAO;FANTASIA', '"123456";"1";"A";"B"'].join('\n')
  assert.throws(() => gerar(csv, ''), /cabeçalho/)
})

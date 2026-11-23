// Exporta os 13 programas de treinamento v2 e as 6 apostilas de Aplicacao Dia 1
// para dados/treinamentos.json, que alimenta o site ccc+motorbr.
// Rodar de novo quando os programas mudarem:  node extrair_treinamentos.js
const fs = require('fs');
const path = require('path');

const BASE = 'D:\\Claude\\manual de emrpesas\\+MOTORBR\\treinamentos';
const SAIDA = path.join(__dirname, '..', 'dados', 'treinamentos.json');

// id do cargo no site <- numero do programa (mesma chave de cargos.json)
const CARGO = {
  '01': 'consultor', '02': 'financ', '03': 'consig', '04': 'sdr', '05': 'recep',
  '06': 'assadm', '07': 'rh', '08': 'motorista', '09': 'asg', '10': 'ceo',
  '11': 'gadm', '12': 'gmkt', '13': 'social',
};

const programas = fs.readdirSync(path.join(BASE, 'programas'))
  .filter(f => f.endsWith('.js')).sort()
  .map(arquivo => {
    const d = require(path.join(BASE, 'programas', arquivo));
    const num = arquivo.slice(0, 2);
    return {
      num,
      cargo: CARGO[num],
      nome: d.nome,
      cbo: d.cbo || '',
      superior: d.superior || '',
      carga: d.carga || '',
      missao: d.missao || '',
      objetivo: d.objetivo || '',
      resultados: d.resultados || [],
      modulos: (d.modulos || []).map(m => ({
        titulo: m.t, duracao: m.d || '', objetivo: m.obj || '',
        conteudo: m.c || [], erro: m.erro || '', regra: m.regra || '',
      })),
      quiz: (d.quiz || []).map(q => Array.isArray(q)
        ? { pergunta: q[0], resposta: q[1] }
        : { pergunta: q.p || q.pergunta || '', resposta: q.r || q.resposta || '' }),
    };
  });

// Aplicacao Dia 1: regra de ouro por modulo, diagnostico do cargo e duvidas frequentes
const dados = require(path.join(BASE, 'aplicacao-dados.js'));
const aplicacao = (Array.isArray(dados) ? dados : Object.values(dados)).map(a => ({
  num: a.arquivo.slice(0, 2),
  cargo: a.cargoId,
  regras: (a.regras || []).map(([modulo, regra]) => ({ modulo, regra })),
  diagnostico: a.diagnostico || [],
  conformidade: a.conformidadeExtra || [],
  duvidas: (a.duvidas || []).map(d => Array.isArray(d)
    ? { pergunta: d[0], resposta: d[1] }
    : { pergunta: d.p || d.pergunta || '', resposta: d.r || d.resposta || '' }),
}));

fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
fs.writeFileSync(SAIDA, JSON.stringify({ programas, aplicacao }, null, 1), 'utf8');

console.log(`${programas.length} programas, ${aplicacao.length} apostilas -> treinamentos.json`);
const semCargo = programas.filter(p => !p.cargo).map(p => p.num);
if (semCargo.length) throw new Error('programa sem cargo mapeado: ' + semCargo.join(', '));
const semModulo = programas.filter(p => !p.modulos.length).map(p => p.num);
if (semModulo.length) throw new Error('programa sem modulos: ' + semModulo.join(', '));

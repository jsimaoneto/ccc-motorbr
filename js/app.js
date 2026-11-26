/* ccc+motorbr — site informativo da +Motor BR.
   Os dados vêm de dados/*.json, gerados pelos scripts em fonte/ a partir dos
   arquivos originais (manual ABNT, cargos/dados.py, processo-vendas/gerar.py e
   treinamentos/programas). Nada de conteúdo é digitado aqui. */

const D = {};               // manual, cargos, processo, treinamentos
const $ = (s, r = document) => r.querySelector(s);
const esc = (t) => String(t == null ? '' : t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const NIVEIS = ['Alta Direção', 'Gerência', 'Operacional', 'Suporte Administrativo'];

/* ------------------------------------------------------------------ carga */
async function carregar() {
  const nomes = ['manual', 'cargos', 'processo', 'treinamentos', 'documentos', 'downloads', 'checklists'];
  const partes = await Promise.all(
    nomes.map(n => fetch(`dados/${n}.json?v=6`).then(r => {
      if (!r.ok) throw new Error(`${n}.json: ${r.status}`);
      return r.json();
    }))
  );
  nomes.forEach((n, i) => { D[n] = partes[i]; });
}

/* ------------------------------------------------------------------ menu */
function montarMenu() {
  const porNivel = {};
  D.cargos.forEach(c => (porNivel[c.nivel] = porNivel[c.nivel] || []).push(c));

  let h = `
    <div class="secao">A empresa</div>
    <a href="#/inicio" data-rota="inicio">Início</a>
    <a href="#/cultura" data-rota="cultura">Cultura e valores</a>
    <a href="#/politicas" data-rota="politicas">Políticas internas<span class="conta">${D.manual.politicas.length}</span></a>
    <div class="secao">Processo de vendas</div>
    <a href="#/processo" data-rota="processo">Fluxograma geral<span class="conta">${D.processo.total}</span></a>
    <a href="#/checklists" data-rota="checklists">Checklists do veículo<span class="conta">${
      D.checklists.vistoria.total + D.checklists.recebimento.total}</span></a>`;

  NIVEIS.forEach(nivel => {
    const lista = porNivel[nivel] || [];
    if (!lista.length) return;
    h += `<div class="secao">${esc(nivel)}</div>`;
    lista.forEach(c => {
      const itens = (D.processo.por_cargo[c.id] || []).length;
      h += `<a href="#/cargo/${c.id}" data-rota="cargo/${c.id}">${esc(curto(c.nome))}`
         + (itens ? `<span class="conta">${itens}</span>` : '') + `</a>`;
    });
  });

  h += `<div class="secao">Formação</div>
        <a href="#/treinamentos" data-rota="treinamentos">Programas de treinamento<span class="conta">${D.treinamentos.programas.length}</span></a>
        <div class="secao">Arquivos</div>
        <a href="#/downloads" data-rota="downloads">Download<span class="conta">${
          D.downloads.grupos.reduce((s, g) => s + g.arquivos.length, 0)}</span></a>
        <a href="#/documentos" data-rota="documentos">Ler no Drive</a>`;
  $('#lateral').innerHTML = h;
}

// nomes longos de cargo não cabem no menu
function curto(nome) {
  return nome
    .replace('Analista de Financiamento e Documentação Veicular', 'Analista de Financiamento')
    .replace('Assistente de Consignação Veicular e Captação de Clientes', 'Consignação e Captação')
    .replace('Atendente de Recepção / Balcão de Clientes', 'Atendente de Recepção')
    .replace('Assistente de Recursos Humanos (Gestão de Pessoal)', 'Assistente de RH')
    .replace('Social Media (Analista de Mídias Sociais)', 'Social Media')
    .replace('Diretor-Presidente / CEO', 'Diretor-Presidente (CEO)');
}

/* ------------------------------------------------------------------ páginas */
function paginaInicio() {
  const c = D.manual.cultura;
  const nCargos = D.cargos.length;
  const nTreinos = D.treinamentos.programas.length;

  return `
  <section class="capa">
    <p class="rotulo">Manual organizacional · edição 2026</p>
    <h1>+Motor BR</h1>
    <hr class="filete">
    <p>Veículos de procedência comprovada, atendimento transparente e processo que não depende
       da memória de ninguém. Este site reúne a cultura, as políticas internas, a descrição de
       cada cargo, os checklists do dia a dia e o processo de vendas completo da empresa.</p>
    <div class="atalhos">
      <a class="atalho" href="#/processo">Ver o processo de vendas</a>
      <a class="atalho vazado" href="#/politicas">Políticas internas</a>
      <a class="atalho vazado" href="#/documentos">Documentos originais</a>
    </div>
  </section>

  <section class="bloco">
    <div class="grade-3">
      <div class="cartao"><div class="destaque">${nCargos}</div><div class="legenda">cargos descritos, do CEO ao auxiliar</div></div>
      <div class="cartao"><div class="destaque">${D.processo.total}</div><div class="legenda">itens de checklist em ${D.processo.fases.length} fases</div></div>
      <div class="cartao"><div class="destaque">${D.manual.politicas.length}</div><div class="legenda">políticas internas em vigor</div></div>
      <div class="cartao"><div class="destaque">${nTreinos}</div><div class="legenda">programas de treinamento</div></div>
    </div>
  </section>

  <section class="bloco" id="empresa">
    <p class="rotulo">Quem somos</p>
    <h2>A +Motor BR</h2>
    <hr class="filete">
    ${c.apresentacao.map(p => `<p>${esc(p)}</p>`).join('')}
  </section>

  <section class="bloco">
    <div class="grade">
      <div class="cartao">
        <p class="rotulo">Missão</p>
        <p>${esc(c.missao)}</p>
      </div>
      <div class="cartao">
        <p class="rotulo">Visão</p>
        <p>${esc(c.visao)}</p>
      </div>
    </div>
  </section>

  <section class="bloco" id="valores">
    <p class="rotulo">O que nos orienta</p>
    <h2>Valores institucionais</h2>
    <hr class="filete">
    <p class="abertura">${esc(c.valores_intro)}</p>
    <div class="grade" style="margin-top:var(--e5)">
      ${c.valores.map(v => `
        <div class="cartao">
          <h4>${esc(v.nome)}</h4>
          <p class="legenda" style="font-size:15px;color:var(--texto-fraco)">${esc(v.descricao)}</p>
        </div>`).join('')}
    </div>
  </section>

  <section class="bloco">
    <div class="faixa">
      <p class="rotulo" style="color:var(--laranja)">Parte II do manual</p>
      <h2>Políticas internas</h2>
      <p>Dez políticas que traduzem a CLT, o Código de Defesa do Consumidor, a LGPD, a lei do COAF
         e as normas de saúde e segurança para o dia a dia da loja.</p>
      <p style="margin-top:var(--e4)"><a class="atalho" href="#/politicas">Ler as políticas</a></p>
    </div>
  </section>

  <section class="bloco">
    <p class="rotulo">Por onde seguir</p>
    <h2>Cada cargo em um lugar só</h2>
    <hr class="filete">
    <p class="abertura">Na página de cada cargo estão a descrição, o checklist por frequência,
       os indicadores, a parte do processo de vendas que é dele e o programa de treinamento.</p>
    <div class="grade" style="margin-top:var(--e5)">
      ${D.cargos.slice(0, 6).map(c2 => `
        <a class="cartao" href="#/cargo/${c2.id}">
          <p class="rotulo">${esc(c2.nivel)}</p>
          <h4>${esc(curto(c2.nome))}</h4>
          <p class="legenda">${(D.processo.por_cargo[c2.id] || []).length} itens no processo · CBO ${esc(c2.cbo)}</p>
          <p class="seta">Abrir →</p>
        </a>`).join('')}
    </div>
  </section>`;
}

function paginaCultura() {
  const c = D.manual.cultura;
  return `
  <p class="trilha"><a href="#/inicio">Início</a> › Cultura e valores</p>
  <p class="rotulo">Parte I do manual</p>
  <h1>Cultura organizacional</h1>
  <hr class="filete">
  <section class="bloco">
    ${c.apresentacao.map(p => `<p>${esc(p)}</p>`).join('')}
  </section>
  <section class="bloco">
    <div class="grade">
      <div class="cartao"><p class="rotulo">Missão</p><p>${esc(c.missao)}</p></div>
      <div class="cartao"><p class="rotulo">Visão</p><p>${esc(c.visao)}</p></div>
    </div>
  </section>
  <section class="bloco">
    <h2>Valores institucionais</h2>
    <hr class="filete">
    <p class="abertura">${esc(c.valores_intro)}</p>
    <div class="grade" style="margin-top:var(--e5)">
      ${c.valores.map(v => `<div class="cartao"><h4>${esc(v.nome)}</h4>
        <p style="font-size:15px;color:var(--texto-fraco);margin:0">${esc(v.descricao)}</p></div>`).join('')}
    </div>
  </section>`;
}

function paginaPoliticas() {
  const p = D.manual.politicas;
  return `
  <p class="trilha"><a href="#/inicio">Início</a> › Políticas internas</p>
  <p class="rotulo">Parte II do manual</p>
  <h1>Políticas internas</h1>
  <hr class="filete">
  <p class="abertura">Nenhuma política interna substitui a legislação vigente: ela a operacionaliza
     no dia a dia da empresa. Cada política traz a base legal, o que se espera e o que é vedado.</p>

  <section class="bloco" style="margin-top:var(--e6)">
    ${p.map(pol => `
      <div class="cartao" style="margin-bottom:var(--e4)" id="p${pol.num.replace('.', '-')}">
        <p class="rotulo">${esc(pol.num)}</p>
        <h3>${esc(pol.nome)}</h3>
        ${pol.base ? `<p class="legenda" style="margin-bottom:var(--e3)"><b>Base:</b> ${esc(pol.base)}</p>` : ''}
        ${pol.intro.map(t => `<p style="font-size:15.5px">${esc(t)}</p>`).join('')}
        ${(pol.esperadas.length || pol.vedadas.length) ? `
        <div class="condutas">
          ${pol.esperadas.length ? `<div class="conduta sim"><h4>Condutas esperadas</h4>
            <ul>${pol.esperadas.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
          ${pol.vedadas.length ? `<div class="conduta nao"><h4>Condutas vedadas</h4>
            <ul>${pol.vedadas.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
        </div>` : ''}
      </div>`).join('')}
  </section>

  <section class="bloco">
    <h2>Medidas disciplinares</h2>
    <hr class="filete">
    <p class="abertura">O descumprimento é apurado de forma proporcional, observado o contraditório.</p>
    <table class="tabela" style="margin-top:var(--e4)">
      <thead><tr><th>Gravidade</th><th>Exemplo</th><th>Medida</th></tr></thead>
      <tbody>${D.manual.disciplina.map(d => `<tr>
        <td><b>${esc(d.gravidade)}</b></td><td>${esc(d.exemplo)}</td><td>${esc(d.medida)}</td></tr>`).join('')}
      </tbody>
    </table>
  </section>

  <section class="bloco">
    <div class="aviso">${esc(D.manual.termo)}</div>
  </section>`;
}

function fichaFase(f) {
  const campos = [['Objetivo', f.objetivo], ['Gatilho', f.gatilho], ['Dono', f.dono],
                  ['Prazo', f.prazo], ['Passa para', f.passa]].filter(x => x[1]);
  return `<div class="ficha-fase">${campos.map(([k, v]) =>
    `<div><b>${k}</b>${esc(v)}</div>`).join('')}</div>`;
}

/* Como cada cadência aparece escrita no item */
const CADENCIA = {
  '2h': 'de 2 em 2 horas', dia: 'todo dia', sexta: 'toda sexta',
  segunda: 'toda segunda', '15d': 'a cada 15 dias', mes: 'todo mês',
  marcos: 'em datas marcadas',
};

function seloRepete(r) {
  if (!r) return '';
  const quando = r.cada === 'marcos'
    ? (r.marcos || []).join(' · ')
    : CADENCIA[r.cada] || r.cada;
  return `<span class="selo repete" title="${esc(r.ate ? 'até ' + r.ate : '')}">↻ ${esc(quando)}</span>`;
}

function linhaItem(item, comQuem = true) {
  const selos = item.origens.map(o =>
    `<span class="selo ${o[0].toLowerCase()}">${esc(o)}</span>`).join('');
  return `<div class="item${item.repete ? ' e-repetido' : ''}">
    <span class="marca-item" aria-hidden="true">${item.repete ? '↻' : '◦'}</span>
    <span class="texto-item">${esc(item.texto)}${selos}${seloRepete(item.repete)}
      ${item.repete && item.repete.desdobra ? `<span class="desdobra">Na prática são ${item.repete.desdobra.length} cobranças: ${
        item.repete.desdobra.map(d => `${esc(d.titulo)} (${CADENCIA[d.cada] || d.cada})`).join(' · ')}</span>` : ''}
      ${item.repete && item.repete.nota ? `<span class="desdobra">${esc(item.repete.nota)}</span>` : ''}
    </span>
    ${comQuem ? `<span class="quem">${esc(item.quem)}</span>` : ''}
  </div>`;
}

function paginaProcesso() {
  return `
  <p class="trilha"><a href="#/inicio">Início</a> › Processo de vendas</p>
  <p class="rotulo">Fluxograma geral</p>
  <h1>Processo de vendas</h1>
  <hr class="filete">
  <p class="abertura">As ${D.processo.fases.length} fases do processo, da entrada do veículo no estoque
     ao pós-venda, com ${D.processo.total} itens de checklist. Cada item traz o responsável e para
     quais veículos vale. Clique em uma fase para abrir.</p>

  <div class="aviso" style="margin-top:var(--e5)">
    <b>Como ler os selos:</b> <span class="selo t">Todos</span> vale para qualquer veículo ·
    <span class="selo u">Usado</span> comprado para estoque, inclusive o recebido na troca ·
    <span class="selo c">Consignado</span> deixado pelo proprietário ·
    <span class="selo z">Zero km</span>.
  </div>

  <section class="bloco" style="margin-top:var(--e6)">
    <div class="grade">
      <div class="cartao">
        <div class="destaque">${D.processo.unicos}</div>
        <div class="legenda"><b>itens de uma vez só.</b> Acontecem uma vez no ciclo daquele
          veículo ou daquela venda: avaliar a entrada, conferir a procedência, assinar o contrato,
          entregar as chaves. Marcou, acabou.</div>
      </div>
      <div class="cartao" style="border-color:var(--marinho)">
        <div class="destaque" style="color:var(--marinho)">${D.processo.recorrentes}</div>
        <div class="legenda"><b>itens que voltam.</b> Marcou hoje, reaparecem quando vence o prazo:
          ligar o carro no pátio, cobrar o follow-up, mandar o reporte do dia. No site de operação
          eles ressurgem sozinhos; aqui aparecem marcados com <span class="selo repete">↻</span>.</div>
      </div>
    </div>
    <table class="tabela" style="margin-top:var(--e4)">
      <thead><tr><th>Eixo</th><th>O que faz o item voltar</th></tr></thead>
      <tbody>${Object.entries(D.processo.eixos).map(([k, v]) =>
        `<tr><td><b>${esc({veiculo: 'Veículo', lead: 'Lead', pessoa: 'Rotina do cargo', pos_venda: 'Pós-venda'}[k] || k)}</b></td>
         <td>${esc(v)}</td></tr>`).join('')}
      </tbody>
    </table>

    <h3 style="margin-top:var(--e6)">E um terceiro tipo: por ocasião</h3>
    <hr class="filete">
    <p class="abertura">${esc(D.processo.tipos.ocasiao)}</p>
    <div class="grade" style="margin-top:var(--e4)">
      ${D.processo.por_ocasiao.map(o => `
        <div class="cartao">
          <p class="rotulo">${o.tipo === 'unico' ? 'Uma vez só' : 'A cada ocasião'}</p>
          <h4>${esc(o.o_que)}</h4>
          <p class="legenda">${esc(o.onde)}</p>
          <p style="font-size:15px;margin:var(--e2) 0 0">
            ${o.gatilhos.map(g => `<span class="selo t">${esc(g)}</span>`).join(' ')}</p>
          ${o.nota ? `<p class="legenda" style="margin-top:var(--e2)">${esc(o.nota)}</p>` : ''}
        </div>`).join('')}
    </div>
  </section>

  <section class="bloco">
    ${D.processo.fases.map(f => `
      <details class="fase" id="fase-${esc(f.n)}">
        <summary>
          <span class="numero">${esc(f.n)}</span>
          <span class="titulo-fase">${esc(f.titulo)}
            <small>${f.grupos.reduce((s, g) => s + g.itens.length, 0)} itens · ${esc(f.dono || '—')}</small>
          </span>
        </summary>
        <div class="miolo">
          ${fichaFase(f)}
          ${f.grupos.map(g => `
            <div class="grupo-itens">
              <h4>${esc(g.titulo)}</h4>
              ${g.itens.map(i => linhaItem(i)).join('')}
            </div>`).join('')}
        </div>
      </details>`).join('')}
  </section>`;
}

function paginaCargo(id) {
  const c = D.cargos.find(x => x.id === id);
  if (!c) return `<h1>Cargo não encontrado</h1><p><a href="#/inicio">Voltar ao início</a></p>`;

  const doProcesso = D.processo.por_cargo[c.id] || [];
  const treino = D.treinamentos.programas.find(p => p.cargo === c.id);
  const aplic = D.treinamentos.aplicacao.find(a => a.cargo === c.id);

  // itens do processo agrupados por fase, na ordem do fluxograma
  const porFase = [];
  doProcesso.forEach(i => {
    let g = porFase.find(x => x.fase === i.fase);
    if (!g) porFase.push(g = { fase: i.fase, titulo: i.fase_titulo, itens: [] });
    g.itens.push(i);
  });

  const abas = [
    ['descricao', 'Descrição'],
    ['checklist', `Checklist (${c.grupos.reduce((s, g) => s + g[1].length, 0)})`],
    doProcesso.length ? ['fluxo', `No processo (${doProcesso.length})`] : null,
    treino ? ['treino', 'Treinamento'] : null,
    aplic ? ['dia1', 'Aplicação dia 1'] : null,
  ].filter(Boolean);

  return `
  <p class="trilha"><a href="#/inicio">Início</a> › ${esc(c.nivel)} › ${esc(curto(c.nome))}</p>
  <p class="rotulo">${esc(c.nivel)}</p>
  <h1>${esc(c.nome)}</h1>
  <hr class="filete">
  <p class="abertura">${esc(c.resumo)}</p>

  <div class="ficha" style="margin-top:var(--e5)">
    <div><b>CBO</b><span>${esc(c.cbo)}</span></div>
    <div><b>Título oficial</b><span>${esc(c.oficial)}</span></div>
    <div><b>Setor</b><span>${esc(c.setor)}</span></div>
    <div><b>Responde a</b><span>${esc(c.superior)}</span></div>
    ${c.subordinados ? `<div><b>Equipe</b><span>${esc(c.subordinados)}</span></div>` : ''}
  </div>

  ${c.ajuste ? `<div class="aviso"><b>Conferência do código CBO:</b> ${esc(c.ajuste[2])}</div>` : ''}

  <div class="abas" role="tablist">
    ${abas.map(([k, r], n) => `<button role="tab" data-painel="${k}" class="${n === 0 ? 'ativa' : ''}">${esc(r)}</button>`).join('')}
  </div>

  <div class="painel ativo" data-painel="descricao">
    <h3>O que esse cargo entrega</h3>
    <hr class="filete">
    <p>${esc(c.resumo)}</p>
    ${c.kpis && c.kpis.length ? `
      <h3 style="margin-top:var(--e6)">Indicadores acompanhados</h3>
      <hr class="filete">
      <div class="grade">${c.kpis.map(k => `<div class="cartao"><p style="margin:0">${esc(k)}</p></div>`).join('')}</div>` : ''}
  </div>

  <div class="painel" data-painel="checklist">
    <h3>Checklist por frequência</h3>
    <hr class="filete">
    <p class="abertura">O que esse cargo faz, agrupado por quando faz.</p>
    ${c.grupos.map(([titulo, itens]) => `
      <div class="cartao" style="margin-top:var(--e4)">
        <h4>${esc(titulo)} <span class="legenda">· ${itens.length} itens</span></h4>
        ${itens.map(t => `<div class="item"><span class="marca-item">◦</span>
          <span class="texto-item">${esc(t)}</span></div>`).join('')}
      </div>`).join('')}
  </div>

  ${doProcesso.length ? `
  <div class="painel" data-painel="fluxo">
    <h3>A parte dele no processo de vendas</h3>
    <hr class="filete">
    <p class="abertura">${doProcesso.length} dos ${D.processo.total} itens do processo passam por este cargo.
       <a href="#/processo">Ver o processo inteiro</a>.</p>
    ${porFase.map(g => `
      <div class="cartao" style="margin-top:var(--e4)">
        <h4>Fase ${esc(g.fase)} · ${esc(g.titulo)}</h4>
        ${g.itens.map(i => linhaItem(i, i.quem.includes('/'))).join('')}
      </div>`).join('')}
  </div>` : ''}

  ${treino ? `
  <div class="painel" data-painel="treino">
    <h3>Programa de treinamento</h3>
    <hr class="filete">
    <div class="ficha">
      <div><b>Carga</b><span>${esc(treino.carga)}</span></div>
      <div><b>Módulos</b><span>${treino.modulos.length}</span></div>
      <div><b>Responde a</b><span>${esc(treino.superior)}</span></div>
    </div>
    <p class="citacao">${esc(treino.missao)}</p>
    <h4 style="margin-top:var(--e6)">Objetivo</h4>
    <p>${esc(treino.objetivo)}</p>
    ${treino.resultados.length ? `<h4>Ao final, a pessoa consegue</h4>
      <ul>${treino.resultados.map(r => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
    ${treino.modulos.map((m, n) => `
      <div class="cartao" style="margin-top:var(--e4)">
        <p class="rotulo">Módulo ${n + 1} · ${esc(m.duracao)}</p>
        <h4>${esc(m.titulo)}</h4>
        ${m.objetivo ? `<p class="legenda" style="font-size:15px">${esc(m.objetivo)}</p>` : ''}
        ${m.conteudo.map(x => `<div class="item"><span class="marca-item">◦</span>
          <span class="texto-item">${esc(x)}</span></div>`).join('')}
        ${m.regra ? `<p style="margin-top:var(--e3)"><b>Regra de ouro:</b> ${esc(m.regra)}</p>` : ''}
        ${m.erro ? `<p class="legenda"><b>Erro mais comum:</b> ${esc(m.erro)}</p>` : ''}
      </div>`).join('')}
    ${treino.quiz.length ? `
      <h4 style="margin-top:var(--e6)">Perguntas de verificação</h4>
      <hr class="filete">
      ${treino.quiz.map(q => `<div class="cartao" style="margin-bottom:var(--e3)">
        <p style="margin-bottom:var(--e2)"><b>${esc(q.pergunta)}</b></p>
        <p class="legenda" style="margin:0">${esc(q.resposta)}</p></div>`).join('')}` : ''}
  </div>` : ''}

  ${aplic ? `
  <div class="painel" data-painel="dia1">
    <h3>Aplicação no primeiro dia</h3>
    <hr class="filete">
    ${aplic.regras.length ? `<h4>Regras de ouro</h4>
      <div class="grade">${aplic.regras.map(r => `<div class="cartao">
        <p class="rotulo">${esc(r.modulo)}</p><p class="citacao" style="font-size:18px">${esc(r.regra)}</p></div>`).join('')}</div>` : ''}
    ${aplic.diagnostico.length ? `<h4 style="margin-top:var(--e6)">O que é específico da +Motor BR</h4>
      <div class="cartao">${aplic.diagnostico.map(x => `<div class="item"><span class="marca-item">◦</span>
        <span class="texto-item">${esc(x)}</span></div>`).join('')}</div>` : ''}
    ${aplic.duvidas.length ? `<h4 style="margin-top:var(--e6)">Quem resolve o quê</h4>
      <table class="tabela"><thead><tr><th>Situação</th><th>Com quem</th></tr></thead>
      <tbody>${aplic.duvidas.map(d => `<tr><td>${esc(d.pergunta)}</td><td>${esc(d.resposta)}</td></tr>`).join('')}</tbody></table>` : ''}
  </div>` : ''}

  ${arquivosDoCargo(c.id)}`;
}

/* links para os arquivos originais no Google Drive */
const LINK = {
  'Google Docs': id => `https://docs.google.com/document/d/${id}/edit`,
  'PDF': id => `https://drive.google.com/file/d/${id}/view`,
};
const docUrl = id => LINK['Google Docs'](id);

function arquivosDoCargo(id) {
  const d = (D.documentos.por_cargo || {})[id];
  if (!d) return '';
  const linhas = [
    d.fluxograma && ['Fluxograma do cargo', 'a parte dele no processo de vendas', d.fluxograma],
    d.fluxograma_extra && [d.fluxograma_extra.titulo, 'função acumulada', d.fluxograma_extra.id],
    d.treinamento && ['Programa de treinamento', 'módulos, carga e verificação', d.treinamento],
    d.dia1 && ['Apostila Aplicação Dia 1', 'o que fazer no primeiro dia', d.dia1],
  ].filter(Boolean);
  if (!linhas.length) return '';
  return `
    <h3 style="margin-top:var(--e7)">Arquivos deste cargo</h3>
    <hr class="filete">
    <p class="abertura">Os documentos originais no Google Drive da empresa.</p>
    <div class="grade" style="margin-top:var(--e4)">
      ${linhas.map(([t, nota, id]) => `
        <a class="cartao" href="${docUrl(id)}" target="_blank" rel="noopener">
          <p class="rotulo">Google Docs</p>
          <h4>${esc(t)}</h4>
          <p class="legenda">${esc(nota)}</p>
          <p class="seta">Abrir no Drive ↗</p>
        </a>`).join('')}
    </div>`;
}

function paginaDownloads() {
  const d = D.downloads;
  const baixar = id => `https://drive.google.com/uc?export=download&id=${id}`;
  const total = d.grupos.reduce((s, g) => s + g.arquivos.length, 0);
  return `
  <p class="trilha"><a href="#/inicio">Início</a> › Download</p>
  <p class="rotulo">Arquivos do projeto</p>
  <h1>Download</h1>
  <hr class="filete">
  <p class="abertura">Os ${total} arquivos do projeto, como foram gerados, em Word e PDF.
     Clique para baixar direto. Para ler sem baixar, use <a href="#/documentos">Ler no Drive</a>.</p>

  <section class="bloco" style="margin-top:var(--e6)">
    <div class="faixa">
      <h3>Tudo de uma vez</h3>
      <p>A pasta completa no Drive, com as subpastas por tipo de material.</p>
      <p style="margin-top:var(--e4)">
        <a class="atalho" href="${esc(d.pasta)}" target="_blank" rel="noopener">Abrir a pasta ↗</a>
      </p>
    </div>
  </section>

  ${d.grupos.map(g => `
    <section class="bloco">
      <h2>${esc(g.titulo)}</h2>
      <hr class="filete">
      <p class="abertura">${esc(g.nota)}</p>
      <table class="tabela" style="margin-top:var(--e4)">
        <thead><tr><th>Arquivo</th><th>Formato</th><th></th></tr></thead>
        <tbody>
          ${g.arquivos.map(a => `<tr>
            <td>${esc(a.nome)}</td>
            <td><span class="selo ${a.ext === 'pdf' ? 'c' : 'u'}">${esc(a.ext)}</span>
                ${a.tam ? `<span class="legenda"> ${esc(a.tam)}</span>` : ''}</td>
            <td><a href="${baixar(a.id)}">Baixar ↓</a></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </section>`).join('')}`;
}

function paginaDocumentos() {
  const d = D.documentos;
  const cargoNome = id => {
    const c = D.cargos.find(x => x.id === id);
    return c ? curto(c.nome) : id;
  };
  return `
  <p class="trilha"><a href="#/inicio">Início</a> › Documentos</p>
  <p class="rotulo">Arquivos</p>
  <h1>Documentos originais</h1>
  <hr class="filete">
  <p class="abertura">Tudo o que está neste site saiu destes arquivos, guardados no Google Drive
     da empresa. O site é a versão de consulta rápida; o arquivo é a versão oficial, para imprimir
     ou assinar.</p>

  <div class="aviso" style="margin-top:var(--e5)">
    Os arquivos no Drive são privados. Quem abrir sem permissão vai ver a tela de pedir acesso:
    compartilhe a pasta com a pessoa antes de mandar o link.
  </div>

  <section class="bloco">
    <h2>Manual e processo</h2>
    <hr class="filete">
    <div class="grade">
      ${d.geral.map(a => `
        <a class="cartao" href="${(LINK[a.tipo] || docUrl)(a.id)}" target="_blank" rel="noopener">
          <p class="rotulo">${esc(a.tipo)}</p>
          <h4>${esc(a.titulo)}</h4>
          <p class="legenda">${esc(a.nota)}</p>
          <p class="seta">Abrir no Drive ↗</p>
        </a>`).join('')}
    </div>
  </section>

  <section class="bloco">
    <h2>Por cargo</h2>
    <hr class="filete">
    <table class="tabela">
      <thead><tr><th>Cargo</th><th>Fluxograma</th><th>Treinamento</th><th>Dia 1</th></tr></thead>
      <tbody>
        ${Object.entries(d.por_cargo).map(([id, a]) => `
          <tr>
            <td><a href="#/cargo/${id}"><b>${esc(cargoNome(id))}</b></a></td>
            <td>${a.fluxograma ? `<a href="${docUrl(a.fluxograma)}" target="_blank" rel="noopener">abrir ↗</a>` : '<span class="legenda">—</span>'}</td>
            <td>${a.treinamento ? `<a href="${docUrl(a.treinamento)}" target="_blank" rel="noopener">abrir ↗</a>` : '<span class="legenda">—</span>'}</td>
            <td>${a.dia1 ? `<a href="${docUrl(a.dia1)}" target="_blank" rel="noopener">abrir ↗</a>` : '<span class="legenda">—</span>'}</td>
          </tr>`).join('')}
      </tbody>
    </table>
    <p class="legenda" style="margin-top:var(--e4)">Cargos sem fluxograma não têm item próprio no
       processo de vendas depois da correção de 23/11/2026.</p>
  </section>

  <section class="bloco">
    <div class="faixa">
      <h3>A pasta inteira</h3>
      <p>Os arquivos como foram gerados (.docx e .pdf) e as versões em Google Docs para leitura.</p>
      <p style="margin-top:var(--e4)">
        <a class="atalho" href="${esc(d.pasta)}" target="_blank" rel="noopener">Pasta no Drive ↗</a>
        <a class="atalho vazado" href="${esc(d.pasta_docs)}" target="_blank" rel="noopener">Versões em Google Docs ↗</a>
      </p>
    </div>
  </section>`;
}

/* ------------------------------------------------------- checklists do veiculo */
const ARQ_CK = {
  vistoria: { branco: 'arquivos/Checklist-Vistoria-MotorBR-branco.pdf',
              exemplo: 'arquivos/Checklist-Vistoria-MotorBR-exemplo.pdf',
              quando: 'Conferencia de rotina antes de test drive, translado, entrega ao cliente e devolucao.' },
  recebimento: { branco: 'arquivos/Checklist-Recebimento-MotorBR-branco.pdf', exemplo: '',
                 quando: 'Avaliacao tecnica na chegada do carro, antes de entrar no estoque.' },
};

function paginaChecklists() {
  const ck = D.checklists;
  const total = ck.vistoria.total + ck.recebimento.total;
  const bloco = (id) => {
    const c = ck[id]; const a = ARQ_CK[id];
    return `
    <section class="bloco" id="ck-${id}">
      <h2>${esc(c.nome)}</h2>
      <hr class="filete">
      <p class="abertura">${esc(a.quando)} ${c.total} itens em ${c.grupos.length} grupos.</p>
      <p style="margin-top:var(--e4)">
        <a class="atalho" href="${a.branco}" download>Baixar folha em branco (PDF)</a>
        ${a.exemplo ? `<a class="atalho" href="${a.exemplo}" target="_blank" rel="noopener">Ver exemplo preenchido ↗</a>` : ''}
      </p>
      ${c.grupos.map((g, i) => `
        <details class="fase">
          <summary>
            <span class="numero">${i + 1}</span>
            <span class="titulo-fase">${esc(g.t)}
              <small>${g.itens.length} itens · ${esc(g.legenda)}</small>
            </span>
          </summary>
          <div class="miolo">
            <ul class="lista-ck">${g.itens.map((it) => `<li>${esc(it)}</li>`).join('')}</ul>
          </div>
        </details>`).join('')}
    </section>`;
  };
  return `
  <p class="trilha"><a href="#/inicio">Início</a> › Checklists do veículo</p>
  <p class="rotulo">Conferência do veículo</p>
  <h1>Checklists do veículo</h1>
  <hr class="filete">
  <p class="abertura">Os dois modelos de conferência usados na loja, ${total} itens no total.
     Aqui você consulta os itens e baixa a folha em branco para imprimir. Para preencher e guardar
     na ficha do carro, use o sistema do fluxograma.</p>

  <div class="aviso" style="margin-top:var(--e5)">
    <b>Qual usar:</b> <b>Recebimento</b> é a avaliação técnica de quando o carro chega para compra ·
    <b>Vistoria</b> é a conferência de rotina do carro que já é nosso, antes de ele sair da loja.
  </div>

  ${bloco('vistoria')}
  ${bloco('recebimento')}`;
}

function paginaTreinamentos() {
  return `
  <p class="trilha"><a href="#/inicio">Início</a> › Treinamentos</p>
  <p class="rotulo">Formação</p>
  <h1>Programas de treinamento</h1>
  <hr class="filete">
  <p class="abertura">Um programa por cargo, com módulos, carga horária, regras de ouro e
     perguntas de verificação. O programa completo abre dentro da página do cargo.</p>
  <div class="grade" style="margin-top:var(--e5)">
    ${D.treinamentos.programas.map(p => `
      <a class="cartao" href="#/cargo/${p.cargo}">
        <p class="rotulo">Programa ${esc(p.num)}</p>
        <h4>${esc(p.nome)}</h4>
        <p class="legenda">${esc(p.carga)}</p>
        <p class="legenda">${p.modulos.length} módulos · ${p.quiz.length} perguntas</p>
        <p class="seta">Abrir →</p>
      </a>`).join('')}
  </div>`;
}

/* ------------------------------------------------------------------ busca */
let indice = [];

function montarIndice() {
  indice = [];
  const add = (onde, oque, href) => indice.push({ onde, oque, href, chave: oque.toLowerCase() });

  D.cargos.forEach(c => {
    add('Cargo', c.nome, `#/cargo/${c.id}`);
    c.grupos.forEach(([titulo, itens]) =>
      itens.forEach(t => add(`${curto(c.nome)} · ${titulo}`, t, `#/cargo/${c.id}`)));
  });
  D.manual.politicas.forEach(p => {
    add('Política', `${p.num} ${p.nome}`, `#/politicas`);
    [...p.esperadas, ...p.vedadas].forEach(t => add(`Política ${p.num}`, t, `#/politicas`));
  });
  D.manual.cultura.valores.forEach(v => add('Valor', v.nome, '#/cultura'));
  D.processo.fases.forEach(f => {
    add('Fase do processo', `${f.n} ${f.titulo}`, `#/processo#fase-${f.n}`);
    f.grupos.forEach(g => g.itens.forEach(i =>
      add(`Processo · fase ${f.n} · ${i.quem}`, i.texto, `#/processo#fase-${f.n}`)));
  });
  D.treinamentos.programas.forEach(p => {
    p.modulos.forEach(m => add(`Treinamento · ${p.nome}`, m.titulo, `#/cargo/${p.cargo}`));
  });
}

function buscar(termo) {
  const t = termo.trim().toLowerCase();
  const caixa = $('#resultados');
  if (t.length < 2) { caixa.classList.remove('aberto'); return; }

  const achados = indice.filter(x => x.chave.includes(t)).slice(0, 25);
  caixa.innerHTML = achados.length
    ? achados.map(a => `<a href="${a.href}"><span class="onde">${esc(a.onde)}</span>
        <span class="oque">${esc(a.oque)}</span></a>`).join('')
    : `<div class="vazio">Nada encontrado para “${esc(termo)}”.</div>`;
  caixa.classList.add('aberto');
}

/* ------------------------------------------------------------------ rotas */
function rotaAtual() {
  const h = location.hash.replace(/^#\/?/, '');
  return h.split('#')[0] || 'inicio';
}

function render() {
  const rota = rotaAtual();
  const alvo = $('#conteudo');

  if (rota.startsWith('cargo/')) alvo.innerHTML = paginaCargo(rota.slice(6));
  else if (rota === 'cultura') alvo.innerHTML = paginaCultura();
  else if (rota === 'politicas') alvo.innerHTML = paginaPoliticas();
  else if (rota === 'processo') alvo.innerHTML = paginaProcesso();
  else if (rota === 'checklists') alvo.innerHTML = paginaChecklists();
  else if (rota === 'treinamentos') alvo.innerHTML = paginaTreinamentos();
  else if (rota === 'documentos') alvo.innerHTML = paginaDocumentos();
  else if (rota === 'downloads') alvo.innerHTML = paginaDownloads();
  else alvo.innerHTML = paginaInicio();

  document.querySelectorAll('.lateral a').forEach(a =>
    a.classList.toggle('ativo', a.dataset.rota === rota));

  $('#lateral').classList.remove('aberta');
  $('#resultados').classList.remove('aberto');

  // âncora dentro da página (ex.: #/processo#fase-5)
  const ancora = location.hash.split('#')[2];
  if (ancora) {
    const el = document.getElementById(ancora);
    if (el) { if (el.tagName === 'DETAILS') el.open = true; el.scrollIntoView({ block: 'start' }); return; }
  }
  window.scrollTo(0, 0);
  alvo.focus({ preventScroll: true });
}

/* ------------------------------------------------------------------ eventos */
function ligarEventos() {
  window.addEventListener('hashchange', render);

  $('#abrir-menu').addEventListener('click', () => {
    const lat = $('#lateral');
    const aberta = lat.classList.toggle('aberta');
    $('#abrir-menu').setAttribute('aria-expanded', String(aberta));
  });

  const campo = $('#busca');
  campo.addEventListener('input', () => buscar(campo.value));
  campo.addEventListener('keydown', e => {
    if (e.key === 'Escape') { $('#resultados').classList.remove('aberto'); campo.blur(); }
    if (e.key === 'Enter') { const p = $('#resultados a'); if (p) p.click(); }
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.busca')) $('#resultados').classList.remove('aberto');
  });
  // "/" foca a busca, como em sites de documentação
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      e.preventDefault(); campo.focus();
    }
  });

  // abas das páginas de cargo
  $('#conteudo').addEventListener('click', e => {
    const b = e.target.closest('.abas button');
    if (!b) return;
    document.querySelectorAll('.abas button').forEach(x => x.classList.toggle('ativa', x === b));
    document.querySelectorAll('.painel').forEach(p =>
      p.classList.toggle('ativo', p.dataset.painel === b.dataset.painel));
  });
}

/* ------------------------------------------------------------------ senha
   Mesmo obstáculo e mesma senha do site operacional (motorbrfluxograma): segura
   quem chega por acaso, não quem quer entrar. Vale por aba: fechou, pede de novo.
   Os arquivos do Drive continuam abertos a quem tiver o link direto. */
const SENHA_PADRAO = 'motorbr2026';

async function hash(txt) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function entrar() {
  sessionStorage.setItem('cccmotorbr_ok', '1');
  $('#tela-senha').remove();
  document.body.classList.remove('travado');
  iniciar();
}

$('#form-senha').onsubmit = async e => {
  e.preventDefault();
  if (await hash($('#campo-senha').value) === await hash(SENHA_PADRAO)) return entrar();
  $('#erro-senha').style.display = 'block';
  $('#campo-senha').value = '';
};

if (sessionStorage.getItem('cccmotorbr_ok')) entrar();

/* ------------------------------------------------------------------ início */
function iniciar() {
carregar().then(() => {
  montarMenu();
  montarIndice();
  ligarEventos();
  render();
}).catch(err => {
  $('#conteudo').innerHTML = `<h1>Não consegui carregar o conteúdo</h1>
    <p>${esc(err.message)}</p>
    <p class="legenda">Este site lê arquivos JSON; abra por um servidor (ou pelo link publicado),
       não direto do disco.</p>`;
});
}

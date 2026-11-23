# -*- coding: utf-8 -*-
"""Exporta o processo de vendas (13 fases, 125 itens) de processo-vendas/gerar.py
para dados/processo.json, e monta a visao por cargo a partir do mesmo dado.

gerar.py continua sendo a fonte unica. Rodar de novo quando ele mudar:
    python -I extrair_processo.py
"""
import ast, io, json, os

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, "..", "dados", "processo.json")
GERAR = r"D:\Claude\manual de emrpesas\+MOTORBR\processo-vendas\gerar.py"

# FASES usa dict(...), que literal_eval recusa; entao executo so essa atribuicao.
fonte = io.open(GERAR, encoding="utf8").read()
arvore = ast.parse(fonte)
no = next(n for n in arvore.body
          if isinstance(n, ast.Assign) and getattr(n.targets[0], "id", "") == "FASES")
espaco = {"dict": dict}
exec(compile(ast.Module(body=[no], type_ignores=[]), "<fases>", "exec"), espaco)
FASES = espaco["FASES"]

ORIGEM = {"T": "Todos", "U": "Usado", "C": "Consignado", "Z": "Zero km"}

# ---------------------------------------------------------------- fases
fases, total = [], 0
for f in FASES:
    grupos = []
    for subtitulo, itens in f["grupos"]:
        lista = []
        for texto, quem, origens in itens:
            lista.append(dict(texto=texto, quem=quem,
                              origens=[ORIGEM[o] for o in origens]))
            total += 1
        grupos.append(dict(titulo=subtitulo, itens=lista))
    fases.append(dict(n=f["n"], titulo=f["t"], parte=f.get("parte", ""),
                      objetivo=f.get("obj", ""), gatilho=f.get("gatilho", ""),
                      dono=f.get("dono", ""), prazo=f.get("prazo", ""),
                      passa=f.get("passa", ""), grupos=grupos))

# ------------------------------------------------- visao por cargo (campo "quem" cortado por "/")
# Mesmo criterio dos geradores de docx: o item entra no cargo de cada nome citado.
ROTULOS = {
    "Consultor": "consultor", "Pré-Vendas": "sdr", "Social Media": "social",
    "Motorista": "motorista", "Financiamento e Doc.": "financ", "Consignação": "consig",
    "Recepção": "recep", "Serviços Gerais": "asg", "CEO": "ceo",
    "Ger. Administrativo": "gadm", "Fotógrafo": "social", "Ger. Marketing": "gmkt",
    # nao sao cargos: ficam no fluxograma geral, mas nao geram aba propria
    "Automação com IA": None, "Quem pediu o translado": None,
}

por_cargo = {}
for fase in fases:
    for grupo in fase["grupos"]:
        for item in grupo["itens"]:
            for nome in [p.strip() for p in item["quem"].split("/")]:
                cargo = ROTULOS.get(nome)
                if not cargo:
                    continue
                por_cargo.setdefault(cargo, []).append(dict(
                    fase=fase["n"], fase_titulo=fase["titulo"],
                    grupo=grupo["titulo"], texto=item["texto"],
                    quem=item["quem"], origens=item["origens"]))

desconhecidos = sorted({p.strip() for f in fases for g in f["grupos"] for i in g["itens"]
                        for p in i["quem"].split("/") if p.strip() not in ROTULOS})
assert not desconhecidos, f"rotulo de responsavel fora do mapa: {desconhecidos}"
assert total == 125, f"esperava 125 itens, achei {total}"

dados = dict(fases=fases, por_cargo=por_cargo, total=total)
os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
with io.open(SAIDA, "w", encoding="utf8", newline="\n") as fh:
    json.dump(dados, fh, ensure_ascii=False, indent=1)

print(f"{len(fases)} fases, {total} itens, {len(por_cargo)} cargos -> processo.json")
for c, itens in sorted(por_cargo.items(), key=lambda x: -len(x[1])):
    print(f"  {c:10s} {len(itens):3d}")

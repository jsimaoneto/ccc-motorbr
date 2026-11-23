# -*- coding: utf-8 -*-
"""Extrai do Manual Organizacional ABNT as Partes I e II (cultura e politicas)
para dados/manual.json, que alimenta o site ccc+motorbr.

Rodar de novo sempre que o manual mudar:
    python -I extrair_manual.py
"""
import io, json, os, re
from docx import Document

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, "..", "dados", "manual.json")
MANUAL = r"D:\Claude\manual de emrpesas\+MOTORBR\ENTREGAS\1-Manual\Manual_Organizacional_MotorBR_ABNT_final.docx"

doc = Document(MANUAL)
paragrafos = doc.paragraphs


def texto(i):
    return paragrafos[i].text.strip()


def tabela_por_legenda(chave):
    """Acha a tabela cuja legenda ('Tabela N. ...') contem a chave e devolve
    as linhas como listas de celulas."""
    for t in doc.tables:
        linhas = [[c.text.strip() for c in l.cells] for l in t.rows]
        achatado = " ".join(c for l in linhas for c in l)
        if chave.lower() in achatado.lower():
            return linhas
    raise SystemExit(f"tabela nao encontrada: {chave}")


# ---------------------------------------------------------------- Parte I
cultura = dict(
    apresentacao=[texto(4), texto(5)],
    missao=texto(6 + 1),
    visao=texto(8 + 1),
    valores_intro=texto(11),
)

# Tabela 1: valores institucionais (coluna 0 = valor, coluna 1 = aplicacao pratica)
linhas = tabela_por_legenda("Aplicação prática")
valores = []
for l in linhas:
    if len(l) < 2:
        continue
    nome, desc = l[0].strip(), l[1].strip()
    if not nome or nome.lower() in ("valor", "valores"):
        continue
    valores.append(dict(nome=nome, descricao=desc))
cultura["valores"] = valores

# ---------------------------------------------------------------- Parte II
politicas = []
inicio_secoes = [i for i, p in enumerate(paragrafos)
                 if p.style.name == "Heading 2" and re.match(r"^2\.\d+ ", p.text.strip())]

for pos, i in enumerate(inicio_secoes):
    titulo = texto(i)
    num, nome = titulo.split(" ", 1)
    fim = inicio_secoes[pos + 1] if pos + 1 < len(inicio_secoes) else i + 12
    corpo = [texto(j) for j in range(i + 1, fim) if texto(j)]

    base, intro, esperadas, vedadas, modo = "", [], [], [], None
    for linha in corpo:
        if linha.startswith("Base:"):
            base = linha[5:].strip()
        elif linha.startswith("Condutas esperadas"):
            modo = "e"
        elif linha.startswith("Condutas vedadas"):
            modo = "v"
        elif linha.startswith("Tabela ") or linha.startswith("Declaro que"):
            continue
        elif modo == "e":
            esperadas.append(linha)
        elif modo == "v":
            vedadas.append(linha)
        else:
            intro.append(linha)

    politicas.append(dict(num=num, nome=nome, base=base, intro=intro,
                          esperadas=esperadas, vedadas=vedadas))

# Tabela 2: medidas disciplinares (Gravidade | Exemplo | Medida)
linhas = tabela_por_legenda("Gravidade")
disciplina = []
for l in linhas:
    if len(l) < 3 or not l[0].strip() or l[0].strip().lower() == "gravidade":
        continue
    disciplina.append(dict(gravidade=l[0].strip(), exemplo=l[1].strip(), medida=l[2].strip()))

dados = dict(cultura=cultura, politicas=politicas, disciplina=disciplina,
             termo=texto(102))

os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
with io.open(SAIDA, "w", encoding="utf8", newline="\n") as fh:
    json.dump(dados, fh, ensure_ascii=False, indent=2)

print(f"{len(valores)} valores, {len(politicas)} politicas, {len(disciplina)} medidas -> manual.json")

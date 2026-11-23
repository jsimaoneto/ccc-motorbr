# ccc+motorbr

Site informativo interno da **+Motor BR**: cultura, políticas internas, descrição de
cargos, checklists, processo de vendas e programas de treinamento.

Publicado em: https://jsimaoneto.github.io/ccc-motorbr/

Organização e método: José Simão Neto, Psicólogo e Psicanalista, CRP 06/92454.

## Como o conteúdo chega aqui

Nada é digitado no site. Os arquivos em `dados/` são gerados pelos scripts de `fonte/`,
que leem os documentos originais em `D:\Claude\manual de emrpesas\+MOTORBR`:

| Arquivo gerado | Script | Fonte original |
|---|---|---|
| `dados/manual.json` | `fonte/extrair_manual.py` | `ENTREGAS/1-Manual/Manual_Organizacional_MotorBR_ABNT_final.docx` (Partes I e II) |
| `dados/processo.json` | `fonte/extrair_processo.py` | `processo-vendas/gerar.py` (FASES: 13 fases, 125 itens) |
| `dados/treinamentos.json` | `fonte/extrair_treinamentos.js` | `treinamentos/programas/*.js` e `treinamentos/aplicacao-dados.js` |
| `dados/cargos.json` | cópia | `cargos/cargos.json`, exportado de `cargos/dados.py` |

Depois de mudar qualquer documento original:

```
cd fonte
python -I extrair_manual.py
python -I extrair_processo.py
node extrair_treinamentos.js
copy "D:\Claude\manual de emrpesas\+MOTORBR\cargos\cargos.json" ..\dados\
```

Suba o `?v=N` de `css/estilo.css` e `js/app.js` no `index.html` a cada publicação,
senão o navegador da equipe continua com a versão antiga em cache.

## Rodar localmente

O site lê JSON por `fetch`, então não abre direto do disco. Suba um servidor:

```
python -m http.server 8777
```

e abra http://127.0.0.1:8777/

## Identidade visual

Regra 60-30-10: 60% claro, 30% marinho `#0B1F3A` (Centro Clínico Campolim),
10% laranja `#FF5A00` (+Motor BR). Títulos em Cormorant Garamond, texto em Inter.

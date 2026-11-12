# landing/ — a página de venda da trilogia

> Página estática: HTML, CSS e um JS. Sem build, sem npm, sem servidor.
> Sobe em qualquer hospedagem — inclusive nas gratuitas.

## O que é cada arquivo

| Arquivo | O quê | Mexer? |
|---|---|---|
| `index.html` | a página | sim, é a peça |
| `estilo.css` | visual, vindo de `identidade/tokens.json` | sim |
| `pagina.js` | reveal, validação e envio | raramente |
| **`config.js`** | **planilha + links da Amazon** | **é o que tu preenche** |
| `img/`, `arquivos/` | gerados por `scripts/landing.py` | nunca à mão |

---

## Como montar e ver

```powershell
cd "C:\Users\4l13n\Desktop\CHOE Ventures\choe-venture-os\empresas\ebooks"; if ($?) { python scripts\landing.py }
```

Isso recomprime as artes para a web (1,31 MB → 0,37 MB) e copia o EPUB e o
PDF do Livro 1 para `arquivos/`. Depois, para conferir num Chrome de verdade:

```powershell
cd "C:\Users\4l13n\Desktop\CHOE Ventures\choe-venture-os\empresas\ebooks"; if ($?) { node scripts\prova_landing.mjs }
```

A prova sobe um servidor, abre em **1440×900 e em 390×844**, e mede o que
falha calado: fonte que não carregou, reveal que não completou, rolagem
horizontal, imagem quebrada, link morto, e o formulário liberando o download
sem validar. Deixa 4 fotos por tamanho em `build/landing-*.jpg`.

⚠️ **`img/` e `arquivos/` não estão no git** — são derivados. Máquina nova
roda o `landing.py` antes de publicar, ou a página sobe sem imagem nenhuma.

---

## A planilha — onde os cadastros caem

A página manda nome, e-mail e WhatsApp para uma planilha do Google, por um
Apps Script. **Custo zero** e sem limite prático para o volume esperado.

### 1. A planilha

Criar uma planilha nova no Google Sheets. Nome livre — por exemplo
*Alinhamento Divino — cadastros*.

### 2. O script

Na planilha: **Extensões → Apps Script**. Apagar o que estiver lá e colar:

```javascript
function doPost(e) {
  var aba = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

  // Cabeçalho só na primeira vez.
  if (aba.getLastRow() === 0) {
    aba.appendRow(['Data', 'Nome', 'E-mail', 'WhatsApp', 'Origem']);
  }

  var d = e.parameter;
  aba.appendRow([
    new Date(),
    d.nome || '',
    d.email || '',
    // Apóstrofo na frente: sem ele o Sheets lê o telefone como número e
    // come o zero do DDD — 011... vira 11...
    "'" + (d.whatsapp || ''),
    d.origem || ''
  ]);

  return ContentService.createTextOutput('ok');
}
```

### 3. Publicar

**Implantar → Nova implantação → Tipo: app da Web**, e então:

- **Executar como:** eu
- **Quem pode acessar:** **qualquer pessoa** ← sem isso a página não grava

O Google vai pedir autorização da tua conta. 🔴 **Esse aceite é teu** — é a
tua conta Google dando permissão de escrita ao script.

Copiar a URL que termina em `/exec` e colar em `config.js`:

```javascript
planilha: 'https://script.google.com/macros/s/AKfy.../exec',
```

### 4. Conferir que gravou

⚠️ **Esse passo não é opcional.** O envio usa `mode: 'no-cors'` — a única
forma de uma página estática falar com o Apps Script — e o preço é que **a
resposta vem opaca: o navegador não consegue ler se o script gravou**. A
página sabe que a requisição saiu, não que ela funcionou.

Então: preencher o formulário uma vez e **olhar a primeira linha da
planilha**. Sem isso, um script mal publicado engole cadastro em silêncio.

---

## 🔴 A trava do e-mail, medida antes de virar problema

Tu falaste em mandar o livro por e-mail depois, pelo Gmail. **No desenho que
está no ar, isso não é necessário** — a página libera o download na hora, e o
e-mail fica só para avisar quando o Livro II e o III saírem. Isso foi de
propósito: entrega imediata converte melhor e não custa hora tua.

Se mesmo assim entrar envio automático, os tetos são estes e valem saber
antes:

| Caminho | Teto diário |
|---|---|
| `MailApp` do Apps Script, conta `@gmail.com` | **100 destinatários/dia** |
| `MailApp`, conta Workspace paga | 1.500/dia |
| Gmail na mão, pela interface | ~500/dia — e é hora tua, uma a uma |

**Com 150 cadastros/dia, o Apps Script numa conta gratuita estoura no
cadastro 101** — e o modo como ele estoura é o pior: para de enviar sem
avisar ninguém. É mais um motivo para o download sair na hora.

---

## Os links da Amazon

Enquanto `config.js` estiver com `amazon.livro2` e `amazon.livro3` vazios, os
botões daqueles volumes **somem da página** — em vez de virarem links mortos.
Depois de publicar cada volume na KDP, colar o endereço lá e rodar a prova de
novo.

---

## Publicar

Qualquer hospedagem de arquivo estático serve. O conteúdo a subir é esta
pasta inteira, **depois** do `landing.py` (senão vai sem `img/` e sem
`arquivos/`).

⚠️ São ~17 MB em `arquivos/` — o EPUB e o PDF ilustrados do Livro 1. Alguns
planos gratuitos têm teto de tamanho por arquivo; conferir antes.

⚠️ **A landing entrega a edição ILUSTRADA. A KDP recebe `livroN-kdp.epub`,
sem imagem.** São dois pacotes com o mesmo texto e destinos opostos: aqui o
peso não custa nada, e na loja custa R$ 0,30 por MB. Trocar os dois de lugar
não dá erro em lugar nenhum — por isso a linha está escrita aqui e no
`landing.py`.

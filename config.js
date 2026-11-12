/* ============================================================
   config.js — as ÚNICAS coisas que precisam ser preenchidas à mão.

   Está separado do resto de propósito: quem for atualizar um link da Amazon
   daqui a três meses não deveria precisar abrir o HTML nem o JS.

   A página FUNCIONA com estes campos vazios — os botões da Amazon somem
   sozinhos, o formulário grava só no navegador e avisa. Isso é de propósito:
   página que quebra por falta de configuração é página que vai ao ar quebrada.
   ============================================================ */

window.CONFIG = {

  /* ----------------------------------------------------------
     1. ONDE OS CADASTROS SÃO GRAVADOS

     É a URL de um Google Apps Script publicado como aplicativo da web,
     ligado a uma planilha do Google. Grátis, sem limite prático para o
     volume esperado, e os dados caem direto numa planilha tua.

     O passo a passo está em LEIA-ME.md, § "A planilha".
     Enquanto estiver vazio, o formulário libera o download e avisa na tela
     que o cadastro não foi gravado — nunca finge que gravou.
     ---------------------------------------------------------- */
  planilha: '',

  /* ----------------------------------------------------------
     2. OS LINKS DA AMAZON

     Preencher DEPOIS de publicar cada volume na KDP. Enquanto um link estiver
     vazio, o botão daquele volume some da página — em vez de levar o leitor
     para um "#" que não vai a lugar nenhum.
     ---------------------------------------------------------- */
  amazon: {
    livro2: '',
    livro3: ''
  }
};

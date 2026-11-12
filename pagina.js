/* ============================================================
   pagina.js — reveal no scroll, validação e envio do cadastro.

   Duas regras que guiaram este arquivo:

   1. **A página tem que funcionar sem JS.** O CSS só esconde o que vai ser
      revelado DEPOIS que este script marca `js-motion` no <html>. Script
      bloqueado (extensão, rede ruim, erro) deixa a página inteira visível,
      não em branco.
   2. **Nunca dizer que gravou sem ter gravado.** Se a planilha não estiver
      configurada, ou o envio falhar, o download é liberado do mesmo jeito —
      o livro é grátis e não se nega por falha de infraestrutura — mas a tela
      diz o que aconteceu, em vez de mostrar "pronto!" por cima de um erro.
   ============================================================ */

(function () {
  'use strict';

  var cfg = window.CONFIG || {};
  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. reveal no scroll ---------- */

  document.documentElement.classList.add('js-motion');

  var alvos = document.querySelectorAll('.revela, .entra, .filete');

  if (!('IntersectionObserver' in window) || calmo) {
    // Sem suporte, ou com movimento reduzido: tudo já entra visível.
    Array.prototype.forEach.call(alvos, function (el) {
      el.classList.add('dentro');
    });
  } else {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('dentro');
        // Uma vez revelado, para de observar: elemento que entra e sai do
        // viewport não deve re-animar a cada rolagem.
        observador.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    Array.prototype.forEach.call(alvos, function (el) {
      // O herói não espera o scroll — entra assim que a página abre.
      if (el.classList.contains('entra')) {
        requestAnimationFrame(function () { el.classList.add('dentro'); });
      } else {
        observador.observe(el);
      }
    });
  }

  /* ---------- 2. links da Amazon ---------- */

  // Botão sem link configurado SAI da página. Levar o leitor a um "#" que não
  // vai a lugar nenhum é pior que não ter botão.
  Array.prototype.forEach.call(
    document.querySelectorAll('[data-amazon]'),
    function (a) {
      var url = (cfg.amazon || {})[a.dataset.amazon];
      if (url) {
        a.href = url;
        a.target = '_blank';
      } else {
        a.remove();
      }
    }
  );

  /* ---------- 3. formulário ---------- */

  var form = document.getElementById('form-receber');
  if (!form) return;

  var aviso = document.getElementById('aviso');
  var botao = document.getElementById('enviar');
  var painel = document.getElementById('download');
  var campoTel = document.getElementById('whatsapp');

  function fala(texto, erro) {
    aviso.textContent = texto;
    aviso.setAttribute('data-erro', erro ? 'sim' : 'nao');
  }

  /* Máscara do WhatsApp brasileiro. Formata para leitura, mas o que vai para
     a planilha são só os dígitos — telefone guardado com parêntese e traço é
     telefone que não dá para discar nem cruzar depois. */
  campoTel.addEventListener('input', function () {
    var d = campoTel.value.replace(/\D/g, '').slice(0, 11);
    var saida = d;
    if (d.length > 2) saida = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length > 7) {
      var corte = d.length > 10 ? 7 : 6;
      saida = '(' + d.slice(0, 2) + ') ' + d.slice(2, corte) + '-' + d.slice(corte);
    }
    campoTel.value = saida;
  });

  function digitos(v) { return (v || '').replace(/\D/g, ''); }

  function valida(dados) {
    if (dados.nome.length < 2) {
      return { campo: 'nome', erro: 'Escreva seu nome para continuar.' };
    }
    // Deliberadamente simples: e-mail só se valida de verdade enviando um.
    // Regex severa reprova endereço válido, e aqui reprovar é perder o leitor.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(dados.email)) {
      return { campo: 'email', erro: 'Confira o e-mail — parece incompleto.' };
    }
    var tel = digitos(dados.whatsapp);
    if (tel.length < 10 || tel.length > 11) {
      return { campo: 'whatsapp', erro: 'O WhatsApp precisa do DDD e do número.' };
    }
    if (!document.getElementById('aceite').checked) {
      return { campo: 'aceite', erro: 'Marque a autorização para continuar.' };
    }
    return null;
  }

  function limpaMarcas() {
    Array.prototype.forEach.call(
      form.querySelectorAll('[aria-invalid]'),
      function (el) { el.removeAttribute('aria-invalid'); }
    );
  }

  function liberaDownload() {
    form.hidden = true;
    painel.hidden = false;
    painel.scrollIntoView({
      behavior: calmo ? 'auto' : 'smooth',
      block: 'center'
    });
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    limpaMarcas();

    var dados = {
      nome: document.getElementById('nome').value.trim(),
      email: document.getElementById('email').value.trim(),
      whatsapp: digitos(campoTel.value),
      origem: window.location.hostname || 'local'
    };

    var falha = valida(dados);
    if (falha) {
      var el = document.getElementById(falha.campo);
      el.setAttribute('aria-invalid', 'true');
      el.focus();
      fala(falha.erro, true);
      return;
    }

    botao.disabled = true;
    fala('Enviando…', false);

    if (!cfg.planilha) {
      // Sem planilha configurada: entrega o livro e DIZ que não gravou.
      // O silêncio aqui seria a pior escolha — o Pedro descobriria semanas
      // depois, com a planilha vazia e os leitores já perdidos.
      console.warn(
        '[landing] CONFIG.planilha vazio: o cadastro de "' + dados.email +
        '" NÃO foi gravado. Ver LEIA-ME.md, § A planilha.'
      );
      fala('Download liberado. (O cadastro não foi gravado: falta configurar a planilha.)', true);
      liberaDownload();
      botao.disabled = false;
      return;
    }

    /* `no-cors` + form-urlencoded é o que o Apps Script aceita de uma página
       estática sem devolver cabeçalho de CORS. O preço é real e vale saber:
       a resposta vem opaca, então NÃO dá para ler se o script gravou. Só se
       sabe que a requisição saiu. É por isso que a planilha se confere de
       vez em quando — e o teste do LEIA-ME manda conferir a primeira linha. */
    var corpo = new URLSearchParams(dados).toString();

    fetch(cfg.planilha, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: corpo
    }).then(function () {
      fala('', false);
      liberaDownload();
    }).catch(function (e) {
      console.error('[landing] falha ao gravar o cadastro:', e);
      // O livro é grátis: falha de rede não pode virar porta fechada.
      fala('Download liberado. (Não conseguimos registrar seu contato agora.)', true);
      liberaDownload();
    }).then(function () {
      botao.disabled = false;
    });
  });
})();

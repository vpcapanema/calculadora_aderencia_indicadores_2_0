(function () {
  "use strict";

  function buildHeader(target) {
    var subtitle = target.dataset.appSubtitle || "Aplicação Analítica";
    var section = target.dataset.appSection || "Módulo";

    target.className = "app-shell-header";
    target.innerHTML = "" +
      '<div class="app-shell-govbar"><div class="app-shell-govbar__inner"><span class="app-shell-govbar__title">Governo do Estado de São Paulo</span><span class="app-shell-govbar__meta">SIGMA-PLI • ' + section + '</span></div></div>' +
      '<div class="app-shell-navbar"><div class="app-shell-navbar__inner">' +
      '<a class="app-shell-brand" href="./home.html"><span class="app-shell-brand__badge">Σ</span><span class="app-shell-brand__copy"><span class="app-shell-brand__title">SIGMA-PLI</span><span class="app-shell-brand__subtitle">' + subtitle + '</span></span></a>' +
      '<ul class="app-shell-nav"><li><a href="./home.html" data-shell-link="home">Entrada</a></li><li><a href="./avaliacao.html" data-shell-link="avaliacao">Avaliação</a></li><li><a href="./resultados.html" data-shell-link="resultados">Resultados</a></li><li><button type="button" class="app-shell-action" id="btnShellReset">Limpar sessão</button></li></ul>' +
      '</div></div>';

    var filename = (window.location.pathname.split("/").pop() || "home.html").toLowerCase();
    var map = { "home.html": "home", "avaliacao.html": "avaliacao", "resultados.html": "resultados" };
    var activeLink = target.querySelector('[data-shell-link="' + map[filename] + '"]');
    if (activeLink) { activeLink.classList.add("is-active"); }

    var resetButton = target.querySelector("#btnShellReset");
    if (resetButton) {
      resetButton.addEventListener("click", function () {
        window.CalculadoraAderenciaApp.clearAll();
        window.location.href = "./home.html";
      });
    }
  }

  function buildFooter(target) {
    target.innerHTML = '<footer class="sigma-footer"><div class="sigma-footer__inner"><strong>Calculadora de Aderência Metodológica 2.0</strong><span>Fluxo independente, multipágina e auditável no ecossistema SIGMA-PLI.</span><span>Persistência local por navegador.</span></div></footer>';
  }

  document.addEventListener("DOMContentLoaded", function () {
    var shell = document.querySelector("[data-app-shell]");
    var footer = document.querySelector("[data-app-footer]");
    if (shell) { buildHeader(shell); }
    if (footer) { buildFooter(footer); }
  });
})();
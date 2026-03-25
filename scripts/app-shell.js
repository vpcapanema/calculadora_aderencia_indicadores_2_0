(function () {
  "use strict";

  function buildHeader(target) {
    fetch("./templates_modelo/cabecalho_fragment.html")
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");

        /* ── Injetar <style> no <head> ── */
        var styles = doc.querySelectorAll("style");
        styles.forEach(function (s) {
          document.head.appendChild(document.adoptNode(s));
        });

        /* ── Injetar wrapper .sigma-cabecalho-fixo antes do target ── */
        var wrapper = doc.querySelector(".sigma-cabecalho-fixo");
        if (wrapper) {
          target.parentNode.insertBefore(document.adoptNode(wrapper), target);
        }

        /* ── Re-executar scripts (DOMParser não os executa) ── */
        var scripts = doc.querySelectorAll("script");
        scripts.forEach(function (old) {
          var s = document.createElement("script");
          s.textContent = old.textContent;
          document.body.appendChild(s);
        });

        /* ── Remover placeholder antigo ── */
        target.remove();
      })
      .catch(function (err) {
        console.error("Falha ao carregar cabeçalho:", err);
      });
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
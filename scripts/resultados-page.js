(function () {
  "use strict";

  var app = window.CalculadoraAderenciaApp;
  function $(id) { return document.getElementById(id); }
  function icon(name) { return '<svg class="app-title-icon" viewBox="0 0 20 20" aria-hidden="true"><use href="./templates_modelo/app_template_icon_sprite.svg#' + name + '"></use></svg>'; }
  function setTitleIcons() {
    document.querySelectorAll(".cf-section__header").forEach(function (el, index) {
      if (el.querySelector(".app-title-icon")) { return; }
      var names = ["app-icon-paper-plane", "app-icon-layers", "app-icon-compass"];
      el.insertAdjacentHTML("afterbegin", icon(names[index] || "app-icon-info"));
    });
  }
  function getBadgeClass(classificacao) { if (classificacao === "Direto") { return "app-badge app-badge--direto"; } if (classificacao === "Proxy Forte") { return "app-badge app-badge--proxy-forte"; } if (classificacao === "Proxy Moderado") { return "app-badge app-badge--proxy-moderado"; } return "app-badge app-badge--incerto"; }
  function renderResultados() {
    var state = app.getState(); if (!state.indicadores.length) { window.location.href = "./home.html"; return; }
    var resultados = app.buildResultados();
    if (!state.resultadosGerados) { $("tabelaResultados").querySelector("tbody").innerHTML = '<tr><td colspan="5">Consolide os resultados na etapa de avaliação para exibir esta tela.</td></tr>'; $("analiseCriterios").innerHTML = '<div class="app-empty-state">Os resultados finais ainda não foram gerados.</div>'; $("indiceGeralValue").textContent = "--"; $("classificacaoGeralValue").textContent = "--"; $("totalIndicadores").textContent = String(state.indicadores.length); return; }
    var indiceGeral = resultados.reduce(function (acc, item) { return acc + item.ia; }, 0) / resultados.length; var counts = {}; resultados.forEach(function (item) { counts[item.classificacao] = (counts[item.classificacao] || 0) + 1; }); var classificacaoPredominante = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })[0];
    $("indiceGeralValue").textContent = indiceGeral.toFixed(2); $("classificacaoGeralValue").textContent = classificacaoPredominante; $("totalIndicadores").textContent = String(resultados.length);
    $("tabelaResultados").querySelector("tbody").innerHTML = resultados.map(function (resultado, index) { return '<tr><td><strong>' + app.escapeHtml(resultado.indicador.indicador || ("Indicador " + (index + 1))) + '</strong>' + (resultado.penalizacoes.length ? '<div class="app-penalty-note">' + app.escapeHtml(resultado.penalizacoes.join("; ")) + '</div>' : '') + '</td><td><strong>' + resultado.ia.toFixed(2) + '</strong></td><td><span class="' + getBadgeClass(resultado.classificacao) + '">' + resultado.classificacao + '</span></td><td>' + Object.keys(resultado.scores).length + '/7</td><td><div class="app-sensitivity"><span class="app-sensitivity__flag ' + (resultado.sensibilidade.mudaCategoria ? 'app-sensitivity__flag--sensitive' : 'app-sensitivity__flag--stable') + '">' + (resultado.sensibilidade.mudaCategoria ? 'Sensível' : 'Estável') + '</span><span>Faixa: ' + resultado.sensibilidade.iaMin.toFixed(2) + ' a ' + resultado.sensibilidade.iaMax.toFixed(2) + '</span>' + (resultado.sensibilidade.mudaCategoria ? '<span>' + resultado.sensibilidade.classeMin + ' → ' + resultado.sensibilidade.classeMax + '</span>' : '') + '</div></td></tr>'; }).join("");
    $("analiseCriterios").innerHTML = app.CRITERIOS.map(function (criterio, criterioIndex) { var soma = 0; var count = 0; resultados.forEach(function (resultado) { if (resultado.scores[criterioIndex] !== undefined) { soma += resultado.scores[criterioIndex]; count += 1; } }); var media = count > 0 ? (soma / count).toFixed(2) : "N/A"; return '<article class="criterion-analysis-card" style="border-left-color:' + criterio.cor + ';"><h4 class="criterion-analysis-title" style="color:' + criterio.cor + ';">' + criterio.nome + '</h4><p class="criterion-analysis-desc">' + criterio.explicacao + '</p><div class="criterion-analysis-footer"><span>Peso: ' + criterio.peso + '%</span><span>Média: ' + media + '</span></div></article>'; }).join("");
  }
  document.addEventListener("DOMContentLoaded", function () { setTitleIcons(); renderResultados(); $("btnExportarCsv").addEventListener("click", app.exportarCsv); $("btnExportarJson").addEventListener("click", app.exportarJson); $("btnImprimir").addEventListener("click", function () { window.print(); }); });
})();
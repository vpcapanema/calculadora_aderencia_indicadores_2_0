(function () {
  "use strict";

  var app = window.CalculadoraAderenciaApp;
  function $(id) { return document.getElementById(id); }
  function icon(name) { return '<svg class="app-title-icon" viewBox="0 0 20 20" aria-hidden="true"><use href="./templates_modelo/app_template_icon_sprite.svg#' + name + '"></use></svg>'; }
  function setTitleIcons() {
    document.querySelectorAll(".cf-section__header").forEach(function (el, index) {
      if (el.querySelector(".app-title-icon")) { return; }
      var names = ["app-icon-sliders", "app-icon-layers"];
      el.insertAdjacentHTML("afterbegin", icon(names[index] || "app-icon-info"));
    });
  }
  function ensureData() { var state = app.getState(); if (!state.indicadores.length) { window.location.href = "./home.html"; return null; } return state; }
  function renderCriteriaOverview() { $("criteriaOverview").innerHTML = app.CRITERIOS.map(function (criterio, index) { var isEliminatorio = app.LIMIARES_ELIMINATORIOS.some(function (item) { return item.criterioIndex === index; }); return '<article class="app-criterion-chip"><strong>' + criterio.nome + '</strong><span>' + criterio.explicacao + '</span><small>' + criterio.peso + '%</small>' + (isEliminatorio ? '<small>Critério eliminatório</small>' : '') + '</article>'; }).join(""); }
  function renderIndicadores() {
    var state = ensureData(); if (!state) { return; }
    $("indicadoresContainer").innerHTML = state.indicadores.map(function (indicador, indicadorIndex) {
      return '<article class="app-indicator-card"><div class="app-indicator-card__header"><h3>' + app.escapeHtml(indicador.indicador || ("Indicador " + (indicadorIndex + 1))) + '</h3><div class="app-indicator-card__meta">' + app.escapeHtml(indicador.descricao || "Sem descrição") + '<br>Área: ' + app.escapeHtml(indicador.area || "Não informada") + ' • Unidade: ' + app.escapeHtml(indicador.unidade_medida || "Não informada") + ' • Fonte: ' + app.escapeHtml(indicador.fonte || "Não informada") + '</div></div>' + app.CRITERIOS.map(function (criterio, criterioIndex) {
        var selectedVal = state.scores[indicadorIndex] && state.scores[indicadorIndex][criterioIndex] !== undefined ? state.scores[indicadorIndex][criterioIndex] : null;
        var key = indicadorIndex + "-" + criterioIndex;
        var rubricText = selectedVal !== null ? app.getRubricTooltip(criterioIndex, selectedVal) : "Selecione uma nota para exibir a rubrica descritiva.";
        var justText = state.justificativas[key] || "";
        var needsJustification = selectedVal !== null && app.NOTAS_EXIGEM_JUSTIFICATIVA.indexOf(selectedVal) !== -1;
        var isEliminatorio = app.LIMIARES_ELIMINATORIOS.some(function (item) { return item.criterioIndex === criterioIndex; });
        var warning = isEliminatorio && selectedVal !== null && selectedVal < 2 ? '<div class="app-warning-inline">Nota abaixo do limiar mínimo. A classificação final será limitada a Incerto/Espúrio.</div>' : "";
        return '<div class="app-criterion-row"><div class="app-criterion-title">' + app.escapeHtml(criterio.nome) + '<small>' + criterio.peso + '%</small></div><div class="app-criterion-description">' + app.escapeHtml(criterio.explicacao) + '</div><div><div class="app-score-group">' + [0,1,2,3,4,5].map(function (valor) { return '<label class="app-score-item" title="' + app.escapeHtml(app.getRubricTooltip(criterioIndex, valor)) + '"><input type="radio" name="score-' + indicadorIndex + '-' + criterioIndex + '" value="' + valor + '"' + (selectedVal === valor ? ' checked' : '') + '><span>' + valor + '</span></label>'; }).join("") + '</div></div><div><div class="app-rubric-box">' + app.escapeHtml(rubricText) + '</div>' + warning + '<div class="app-score-notes" style="' + (needsJustification ? '' : 'display:none;') + '"><label for="just-' + indicadorIndex + '-' + criterioIndex + '">Justificativa obrigatória para nota ' + (selectedVal !== null ? selectedVal : '') + '</label><textarea id="just-' + indicadorIndex + '-' + criterioIndex + '" rows="3" placeholder="Explique a razão da nota atribuída.">' + app.escapeHtml(justText) + '</textarea></div></div></div>';
      }).join("") + '</article>';
    }).join("");
    bindScoreListeners(); updateProgress();
  }
  function bindScoreListeners() {
    Array.prototype.forEach.call(document.querySelectorAll("#indicadoresContainer input[type='radio']"), function (input) { input.addEventListener("change", function () { var parts = input.name.replace("score-", "").split("-"); var state = app.getState(); var indicadorIndex = Number(parts[0]); var criterioIndex = Number(parts[1]); if (!state.scores[indicadorIndex]) { state.scores[indicadorIndex] = {}; } state.scores[indicadorIndex][criterioIndex] = Number(input.value); app.saveBaseState({ scores: state.scores, resultadosGerados: false }); renderIndicadores(); }); });
    Array.prototype.forEach.call(document.querySelectorAll("#indicadoresContainer textarea[id^='just-']"), function (input) { input.addEventListener("input", function () { var state = app.getState(); var key = input.id.replace("just-", ""); state.justificativas[key] = input.value; app.saveBaseState({ justificativas: state.justificativas, resultadosGerados: false }); updateProgress(); }); });
  }
  function updateProgress() {
    var state = app.getState(); var totalCells = state.indicadores.length * app.CRITERIOS.length; var preenchidas = 0; var justificativasPendentes = 0;
    state.indicadores.forEach(function (_, indicadorIndex) { app.CRITERIOS.forEach(function (_, criterioIndex) { if (state.scores[indicadorIndex] && state.scores[indicadorIndex][criterioIndex] !== undefined) { preenchidas += 1; if (app.NOTAS_EXIGEM_JUSTIFICATIVA.indexOf(state.scores[indicadorIndex][criterioIndex]) !== -1) { var key = indicadorIndex + "-" + criterioIndex; if (!state.justificativas[key] || !state.justificativas[key].trim()) { justificativasPendentes += 1; } } } }); });
    var percentage = totalCells > 0 ? Math.round((preenchidas / totalCells) * 100) : 0; $("progressFill").style.width = percentage + "%"; $("progressText").textContent = preenchidas + " de " + totalCells + " avaliações preenchidas (" + percentage + "%)" + (justificativasPendentes > 0 ? " • " + justificativasPendentes + " justificativa(s) pendente(s)" : ""); $("btnCalcular").disabled = !(totalCells > 0 && preenchidas === totalCells && justificativasPendentes === 0);
  }
  function limparAvaliacoes() { app.saveBaseState({ scores: {}, justificativas: {}, resultadosGerados: false }); renderIndicadores(); }
  function salvarProgresso() { var state = app.getState(); app.saveBaseState({ avaliador: state.avaliador, objetoEstudo: state.objetoEstudo, scores: state.scores, justificativas: state.justificativas, resultadosGerados: false }); var button = $("btnSalvar"); var original = button.textContent; button.textContent = "Salvo"; window.setTimeout(function () { button.textContent = original; }, 1200); }
  function consolidarResultados() { var state = app.getState(); app.persistMetadados(state.avaliador, state.objetoEstudo); app.saveBaseState({ resultadosGerados: true }); window.location.href = "./resultados.html"; }
  document.addEventListener("DOMContentLoaded", function () { if (!ensureData()) { return; } setTitleIcons(); renderCriteriaOverview(); renderIndicadores(); $("btnLimparAvaliacoes").addEventListener("click", limparAvaliacoes); $("btnSalvar").addEventListener("click", salvarProgresso); $("btnCalcular").addEventListener("click", consolidarResultados); });
})();
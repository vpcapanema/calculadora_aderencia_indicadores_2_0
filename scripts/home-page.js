(function () {
  "use strict";

  var app = window.CalculadoraAderenciaApp;

  function $(id) { return document.getElementById(id); }
  function icon(name) { return '<svg class="app-title-icon" viewBox="0 0 20 20" aria-hidden="true"><use href="./templates_modelo/app_template_icon_sprite.svg#' + name + '"></use></svg>'; }
  function setTitleIcons() {
    document.querySelectorAll(".app-template-summary-card__title").forEach(function (el, index) {
      if (el.querySelector(".app-title-icon")) { return; }
      var names = ["app-icon-compass", "app-icon-sliders", "app-icon-paper-plane"];
      el.insertAdjacentHTML("afterbegin", icon(names[index] || "app-icon-info"));
    });
    document.querySelectorAll(".app-template-panel-card__title").forEach(function (el, index) {
      if (el.querySelector(".app-title-icon")) { return; }
      var names = ["app-icon-layers", "app-icon-info"];
      el.insertAdjacentHTML("afterbegin", icon(names[index] || "app-icon-info"));
    });
    document.querySelectorAll(".cf-section__header").forEach(function (el) {
      if (el.querySelector(".app-title-icon")) { return; }
    });
  }
  function showFeedback(message, kind) { var node = $("uploadStatus"); node.textContent = message; node.className = "app-feedback app-feedback--" + kind; node.classList.remove("app-hidden"); }
  function hideFeedback() { $("uploadStatus").classList.add("app-hidden"); }
  function collectRowsRaw() { return Array.prototype.slice.call(document.querySelectorAll("#tableBody tr")).map(function (row) { var item = app.getBlankIndicador(); Array.prototype.forEach.call(row.querySelectorAll("input[data-field]"), function (input) { item[input.dataset.field] = input.value.trim(); }); return item; }); }
  function collectIndicadores() { return collectRowsRaw().filter(function (item) { return item.indicador || item.descricao || item.area || item.unidade_medida || item.fonte; }); }
  function renderTable(rows) { $("tableBody").innerHTML = rows.map(function (item, index) { return '<tr data-row-index="' + index + '"><td><input type="text" data-field="indicador" value="' + app.escapeHtml(item.indicador) + '" placeholder="Nome do indicador"></td><td><input type="text" data-field="descricao" value="' + app.escapeHtml(item.descricao) + '" placeholder="Descrição detalhada"></td><td><input type="text" data-field="area" value="' + app.escapeHtml(item.area) + '" placeholder="Área"></td><td><input type="text" data-field="unidade_medida" value="' + app.escapeHtml(item.unidade_medida) + '" placeholder="Unidade"></td><td><input type="text" data-field="fonte" value="' + app.escapeHtml(item.fonte) + '" placeholder="Fonte"></td><td><button type="button" class="app-row-action" data-action="remove-row">×</button></td></tr>'; }).join(""); updateSummary(); }
  function updateSummary() { var indicadores = collectIndicadores(); $("tableSummary").textContent = indicadores.length > 0 ? indicadores.length + " indicador(es) preparado(s) para avaliação." : "Nenhum indicador confirmado."; }
  function initState() { var state = app.getState(); $("avaliadorInput").value = state.avaliador; $("objetoEstudoInput").value = state.objetoEstudo; renderTable(state.indicadores.length ? state.indicadores : [app.getBlankIndicador()]); }
  function persistMetadataOnly() { app.saveBaseState({ avaliador: $("avaliadorInput").value.trim(), objetoEstudo: $("objetoEstudoInput").value.trim() }); }
  function addRow() { var rows = collectRowsRaw(); rows.push(app.getBlankIndicador()); renderTable(rows); }
  function clearTable() { renderTable([app.getBlankIndicador()]); }
  function removeRow(button) { var row = button.closest("tr"); if (!row) { return; } var rows = collectRowsRaw(); if (rows.length <= 1) { clearTable(); return; } rows.splice(Number(row.dataset.rowIndex), 1); renderTable(rows.length ? rows : [app.getBlankIndicador()]); }
  function handleFile(file) {
    if (!file || !/\.csv$/i.test(file.name)) { showFeedback("Selecione um arquivo CSV válido.", "error"); return; }
    var reader = new FileReader();
    reader.onload = function (event) { try { var indicadores = app.parseCsvContent(event.target.result); if (!indicadores.length) { throw new Error("Nenhum indicador válido foi encontrado no arquivo."); } renderTable(indicadores); showFeedback(indicadores.length + " indicador(es) importado(s) com sucesso.", "success"); } catch (error) { showFeedback(error.message, "error"); } };
    reader.readAsText(file, "utf-8");
  }
  function confirmAndContinue() { var indicadores = collectIndicadores().filter(function (item) { return item.indicador && item.descricao; }); if (!indicadores.length) { showFeedback("Preencha pelo menos nome e descrição de um indicador antes de prosseguir.", "error"); return; } app.saveBaseState({ indicadores: indicadores, scores: {}, justificativas: {}, avaliador: $("avaliadorInput").value.trim(), objetoEstudo: $("objetoEstudoInput").value.trim(), metadados: null, resultadosGerados: false }); window.location.href = "./avaliacao.html"; }
  function bindEvents() {
    $("btnAddRow").addEventListener("click", addRow); $("btnClearTable").addEventListener("click", clearTable); $("btnConfirm").addEventListener("click", confirmAndContinue); $("btnResetarSessao").addEventListener("click", function () { app.clearAll(); initState(); hideFeedback(); });
    $("btnDownloadTemplate").addEventListener("click", function () { app.downloadFile(app.buildTemplateCsv(), "template-ficha-indicadores-PLI.csv", "text/csv;charset=utf-8;"); });
    $("avaliadorInput").addEventListener("change", persistMetadataOnly); $("objetoEstudoInput").addEventListener("change", persistMetadataOnly);
    $("tableBody").addEventListener("click", function (event) { var button = event.target.closest("[data-action='remove-row']"); if (button) { removeRow(button); } }); $("tableBody").addEventListener("input", updateSummary);
    var uploadArea = $("uploadArea"); var csvFile = $("csvFile"); uploadArea.addEventListener("click", function () { csvFile.click(); }); uploadArea.addEventListener("dragover", function (event) { event.preventDefault(); uploadArea.classList.add("is-dragover"); }); uploadArea.addEventListener("dragleave", function () { uploadArea.classList.remove("is-dragover"); }); uploadArea.addEventListener("drop", function (event) { event.preventDefault(); uploadArea.classList.remove("is-dragover"); if (event.dataTransfer.files && event.dataTransfer.files[0]) { handleFile(event.dataTransfer.files[0]); } }); csvFile.addEventListener("change", function () { if (csvFile.files && csvFile.files[0]) { handleFile(csvFile.files[0]); } });
  }
  document.addEventListener("DOMContentLoaded", function () { setTitleIcons(); initState(); bindEvents(); });
})();
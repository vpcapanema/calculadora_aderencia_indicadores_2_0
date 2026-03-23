(function (global) {
  "use strict";

  var STORAGE_KEYS = {
    indicadores: "calc2_indicadores",
    scores: "calc2_scores",
    justificativas: "calc2_justificativas",
    avaliador: "calc2_avaliador",
    objetoEstudo: "calc2_objeto_estudo",
    metadados: "calc2_metadados",
    resultadosGerados: "calc2_resultados_gerados"
  };

  var CRITERIOS = [
    { nome: "Proximidade Conceitual", peso: 30, explicacao: "Alinhamento entre o conceito e o que é medido.", cor: "#003b5a" },
    { nome: "Mecanismo Causal", peso: 20, explicacao: "Força da relação causal entre fenômeno e métrica.", cor: "#1c3d59" },
    { nome: "Validade Empírica", peso: 15, explicacao: "Evidências empíricas e consistência estatística.", cor: "#116593" },
    { nome: "Especificidade", peso: 10, explicacao: "Isolamento do fenômeno alvo de variáveis externas.", cor: "#2aa358" },
    { nome: "Sensibilidade", peso: 10, explicacao: "Reatividade a variações reais no tempo e espaço.", cor: "#f39c12" },
    { nome: "Mensurabilidade", peso: 10, explicacao: "Disponibilidade, precisão e replicabilidade dos dados.", cor: "#3ec26e" },
    { nome: "Custo-benefício", peso: 5, explicacao: "Relação entre esforço de coleta e valor analítico.", cor: "#c0392b" }
  ];

  var LIMIARES_ELIMINATORIOS = [
    { criterioIndex: 0, minimoNota: 2, nome: "Proximidade Conceitual" },
    { criterioIndex: 1, minimoNota: 2, nome: "Mecanismo Causal" }
  ];

  var NOTAS_EXIGEM_JUSTIFICATIVA = [0, 1, 5];

  var RUBRICS = {
    0: { 0: "Nenhuma relação entre o conceito do indicador e o fenômeno estudado.", 1: "Relação tangencial ou muito indireta com o fenômeno.", 2: "Relação parcial, mede aspecto correlato mas não o fenômeno em si.", 3: "Relação moderada, capta parte relevante do fenômeno.", 4: "Relação forte, mede o fenômeno com pequenas limitações.", 5: "Relação direta e inequívoca com o fenômeno de interesse." },
    1: { 0: "Sem mecanismo causal identificável entre indicador e fenômeno.", 1: "Hipótese causal fraca, sem fundamentação teórica robusta.", 2: "Mecanismo causal plausível com muitas variáveis intervenientes.", 3: "Mecanismo causal documentado com algumas ressalvas.", 4: "Mecanismo causal bem estabelecido na literatura.", 5: "Causalidade direta e amplamente comprovada." },
    2: { 0: "Sem evidências empíricas de associação com o fenômeno.", 1: "Evidências pontuais ou anedóticas apenas.", 2: "Alguns estudos com resultados inconsistentes.", 3: "Estudos razoáveis com resultados parcialmente convergentes.", 4: "Base empírica sólida com consistência estatística.", 5: "Ampla validação empírica com alta significância e replicabilidade." },
    3: { 0: "Indicador genérico, influenciado por muitos fatores não relacionados.", 1: "Muito baixa especificidade, difícil isolar o fenômeno alvo.", 2: "Especificidade limitada, variáveis externas relevantes não controladas.", 3: "Especificidade moderada, principais confundidores identificáveis.", 4: "Alta especificidade, poucas variáveis externas interferem.", 5: "Especificidade máxima, indicador isolado e dedicado ao fenômeno." },
    4: { 0: "Insensível a variações reais do fenômeno no tempo ou espaço.", 1: "Detecta apenas variações extremas ou de grande magnitude.", 2: "Sensibilidade limitada, detecta tendências mas não oscilações.", 3: "Sensibilidade moderada, capta mudanças relevantes.", 4: "Boa sensibilidade, reage a variações significativas em tempo útil.", 5: "Alta sensibilidade, detecta variações sutis com rapidez." },
    5: { 0: "Dados inexistentes ou inacessíveis para mensuração.", 1: "Dados esparsos, sem série histórica ou padronização.", 2: "Dados disponíveis, mas com lacunas significativas ou baixa precisão.", 3: "Dados razoavelmente acessíveis e com precisão aceitável.", 4: "Dados bem documentados, acessíveis e replicáveis.", 5: "Dados públicos, padronizados, série histórica longa e alta precisão." },
    6: { 0: "Custo proibitivo de coleta com valor analítico irrisório.", 1: "Custo muito alto para benefício analítico marginal.", 2: "Custo significativo com retorno analítico limitado.", 3: "Relação custo-benefício equilibrada.", 4: "Bom retorno analítico com custo moderado de coleta.", 5: "Excelente retorno, dados de fácil obtenção com alto valor analítico." }
  };

  function getBlankIndicador() { return { indicador: "", descricao: "", area: "", unidade_medida: "", fonte: "" }; }
  function escapeHtml(value) { return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;"); }
  function getStorageJson(key, fallback) { try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (error) { return fallback; } }
  function setStorageJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function getState() { return { indicadores: getStorageJson(STORAGE_KEYS.indicadores, []), scores: getStorageJson(STORAGE_KEYS.scores, {}), justificativas: getStorageJson(STORAGE_KEYS.justificativas, {}), avaliador: localStorage.getItem(STORAGE_KEYS.avaliador) || "", objetoEstudo: localStorage.getItem(STORAGE_KEYS.objetoEstudo) || "", metadados: getStorageJson(STORAGE_KEYS.metadados, null), resultadosGerados: localStorage.getItem(STORAGE_KEYS.resultadosGerados) === "1" }; }
  function saveBaseState(partial) {
    var current = getState();
    var next = {
      indicadores: partial.indicadores !== undefined ? partial.indicadores : current.indicadores,
      scores: partial.scores !== undefined ? partial.scores : current.scores,
      justificativas: partial.justificativas !== undefined ? partial.justificativas : current.justificativas,
      avaliador: partial.avaliador !== undefined ? partial.avaliador : current.avaliador,
      objetoEstudo: partial.objetoEstudo !== undefined ? partial.objetoEstudo : current.objetoEstudo,
      metadados: partial.metadados !== undefined ? partial.metadados : current.metadados,
      resultadosGerados: partial.resultadosGerados !== undefined ? partial.resultadosGerados : current.resultadosGerados
    };
    setStorageJson(STORAGE_KEYS.indicadores, next.indicadores);
    setStorageJson(STORAGE_KEYS.scores, next.scores);
    setStorageJson(STORAGE_KEYS.justificativas, next.justificativas);
    localStorage.setItem(STORAGE_KEYS.avaliador, next.avaliador);
    localStorage.setItem(STORAGE_KEYS.objetoEstudo, next.objetoEstudo);
    if (next.metadados !== null) { setStorageJson(STORAGE_KEYS.metadados, next.metadados); }
    localStorage.setItem(STORAGE_KEYS.resultadosGerados, next.resultadosGerados ? "1" : "0");
    return next;
  }
  function clearAll() { Object.keys(STORAGE_KEYS).forEach(function (key) { localStorage.removeItem(STORAGE_KEYS[key]); }); }
  function parseCsvLine(line) {
    var result = []; var current = ""; var inQuotes = false; var index;
    for (index = 0; index < line.length; index += 1) {
      var char = line.charAt(index); var nextChar = line.charAt(index + 1);
      if (char === '"') { if (inQuotes && nextChar === '"') { current += '"'; index += 1; } else { inQuotes = !inQuotes; } }
      else if (char === "," && !inQuotes) { result.push(current.trim()); current = ""; }
      else { current += char; }
    }
    result.push(current.trim());
    return result.map(function (value) { return value.replace(/^"|"$/g, "").trim(); });
  }
  function parseCsvContent(content) {
    var lines = content.replace(/^\uFEFF/, "").split(/\r?\n/).map(function (line) { return line.trim(); }).filter(function (line) { return line !== "" && line.charAt(0) !== "#"; });
    if (lines.length < 2) { throw new Error("Arquivo deve conter cabeçalho e ao menos uma linha de dados."); }
    var header = parseCsvLine(lines[0]).map(function (item) { return item.toLowerCase(); });
    var expected = ["indicador", "descricao", "area", "unidade_medida", "fonte"];
    if (expected.some(function (item, idx) { return header[idx] !== item; })) { throw new Error("Cabeçalho inválido. Use: indicador,descricao,area,unidade_medida,fonte"); }
    return lines.slice(1).map(function (line) { var values = parseCsvLine(line); return { indicador: values[0] || "", descricao: values[1] || "", area: values[2] || "", unidade_medida: values[3] || "", fonte: values[4] || "" }; }).filter(function (item) { return item.indicador || item.descricao; });
  }
  function buildTemplateCsv() { return ["# TEMPLATE FICHA MÍNIMA DE INDICADORES - PLI SIGMA 2.0", "# Remova estas linhas comentadas antes do upload.", "indicador,descricao,area,unidade_medida,fonte", '"Taxa de Crescimento Populacional","Mede o crescimento anual da população em percentual","Demografia","%","IBGE"', '"Densidade Rodoviária","Extensão de rodovias por área territorial","Transporte","km/km²","DNIT"'].join("\n"); }
  function getRubricTooltip(criterioIndex, nivel) { return RUBRICS[criterioIndex] && RUBRICS[criterioIndex][nivel] ? RUBRICS[criterioIndex][nivel] : ""; }
  function calcularIA(scoresIndicador) { var somaPesos = CRITERIOS.reduce(function (acc, criterio) { return acc + criterio.peso; }, 0); var total = CRITERIOS.reduce(function (acc, criterio, index) { return acc + ((scoresIndicador[index] || 0) * criterio.peso); }, 0); return total / somaPesos; }
  function verificarPenalizacao(scoresIndicador) { return LIMIARES_ELIMINATORIOS.filter(function (limiar) { return scoresIndicador[limiar.criterioIndex] !== undefined && scoresIndicador[limiar.criterioIndex] < limiar.minimoNota; }).map(function (limiar) { return limiar.nome + " = " + scoresIndicador[limiar.criterioIndex] + " (mínimo: " + limiar.minimoNota + ")"; }); }
  function classificar(ia, scoresIndicador) { if (scoresIndicador) { for (var i = 0; i < LIMIARES_ELIMINATORIOS.length; i += 1) { var limiar = LIMIARES_ELIMINATORIOS[i]; if (scoresIndicador[limiar.criterioIndex] !== undefined && scoresIndicador[limiar.criterioIndex] < limiar.minimoNota) { return "Incerto/Espúrio"; } } } if (ia >= 4) { return "Direto"; } if (ia >= 3) { return "Proxy Forte"; } if (ia >= 2) { return "Proxy Moderado"; } return "Incerto/Espúrio"; }
  function calcularSensibilidade(scoresIndicador) {
    var iaAtual = calcularIA(scoresIndicador); var iaMin = Infinity; var iaMax = -Infinity;
    CRITERIOS.forEach(function (_, index) {
      var notaOriginal = scoresIndicador[index] || 0;
      var scoresMenos = Object.assign({}, scoresIndicador); scoresMenos[index] = Math.max(0, notaOriginal - 1); iaMin = Math.min(iaMin, calcularIA(scoresMenos)); iaMax = Math.max(iaMax, calcularIA(scoresMenos));
      var scoresMais = Object.assign({}, scoresIndicador); scoresMais[index] = Math.min(5, notaOriginal + 1); iaMin = Math.min(iaMin, calcularIA(scoresMais)); iaMax = Math.max(iaMax, calcularIA(scoresMais));
    });
    var classAtual = classificar(iaAtual, scoresIndicador); var classeMin = classificar(iaMin, scoresIndicador); var classeMax = classificar(iaMax, scoresIndicador);
    return { iaMin: iaMin, iaMax: iaMax, mudaCategoria: classeMin !== classAtual || classeMax !== classAtual, classeMin: classeMin, classeMax: classeMax };
  }
  function buildResultados() { var state = getState(); return state.indicadores.map(function (indicador, index) { var scoreIndicador = state.scores[index] || {}; var ia = calcularIA(scoreIndicador); return { indicador: indicador, scores: scoreIndicador, ia: ia, classificacao: classificar(ia, scoreIndicador), sensibilidade: calcularSensibilidade(scoreIndicador), penalizacoes: verificarPenalizacao(scoreIndicador) }; }); }
  function persistMetadados(avaliador, objetoEstudo) { var metadados = { dataAvaliacao: new Date().toISOString(), avaliador: avaliador || "", objetoEstudo: objetoEstudo || "", versaoPesos: "2.0", pesos: CRITERIOS.map(function (criterio) { return { nome: criterio.nome, peso: criterio.peso }; }) }; setStorageJson(STORAGE_KEYS.metadados, metadados); return metadados; }
  function csvEscape(value) { var text = String(value == null ? "" : value); if (/[",\n]/.test(text)) { return '"' + text.replace(/"/g, '""') + '"'; } return text; }
  function downloadFile(content, filename, mimeType) { var blob = new Blob([content], { type: mimeType }); var link = document.createElement("a"); var url = URL.createObjectURL(blob); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); }
  function exportarCsv() {
    var resultados = buildResultados(); var header = ["indicador", "descricao", "area", "unidade_medida", "fonte"]; CRITERIOS.forEach(function (criterio) { header.push(criterio.nome.toLowerCase().replace(/[\s-]+/g, "_")); }); header.push("ia_calculado", "classificacao", "sensivel", "ia_min", "ia_max");
    var rows = resultados.map(function (resultado) { var base = [resultado.indicador.indicador, resultado.indicador.descricao, resultado.indicador.area, resultado.indicador.unidade_medida, resultado.indicador.fonte]; CRITERIOS.forEach(function (_, criterioIndex) { base.push(resultado.scores[criterioIndex] !== undefined ? String(resultado.scores[criterioIndex]) : ""); }); base.push(resultado.ia.toFixed(2), resultado.classificacao, resultado.sensibilidade.mudaCategoria ? "SIM" : "NAO", resultado.sensibilidade.iaMin.toFixed(2), resultado.sensibilidade.iaMax.toFixed(2)); return base.map(csvEscape).join(","); });
    downloadFile([header.join(",")].concat(rows).join("\n"), "resultados-aderencia-pli.csv", "text/csv;charset=utf-8;");
  }
  function exportarJson() {
    var state = getState(); var metadados = state.metadados || persistMetadados(state.avaliador, state.objetoEstudo);
    var resultados = buildResultados().map(function (resultado, indicadorIndex) {
      return { nome: resultado.indicador.indicador, descricao: resultado.indicador.descricao, area: resultado.indicador.area, unidade_medida: resultado.indicador.unidade_medida, fonte: resultado.indicador.fonte, avaliacoes: CRITERIOS.map(function (criterio, criterioIndex) { return { criterio: criterio.nome, peso: criterio.peso, nota: resultado.scores[criterioIndex] !== undefined ? resultado.scores[criterioIndex] : null, justificativa: state.justificativas[indicadorIndex + "-" + criterioIndex] || null }; }), resultado: { indice_aderencia: Number(resultado.ia.toFixed(4)), classificacao: resultado.classificacao, penalizacoes: resultado.penalizacoes }, sensibilidade: { ia_minimo: Number(resultado.sensibilidade.iaMin.toFixed(4)), ia_maximo: Number(resultado.sensibilidade.iaMax.toFixed(4)), muda_categoria: resultado.sensibilidade.mudaCategoria, classe_minima: resultado.sensibilidade.classeMin, classe_maxima: resultado.sensibilidade.classeMax } };
    });
    downloadFile(JSON.stringify({ formato: "PLI-SIGMA Relatório Auditável v2.0", exportado_em: new Date().toISOString(), metadados: metadados, configuracao: { criterios: CRITERIOS.map(function (criterio) { return { nome: criterio.nome, peso: criterio.peso }; }), limiares_eliminatorios: LIMIARES_ELIMINATORIOS }, indicadores: resultados }, null, 2), "relatorio-auditavel-pli.json", "application/json;charset=utf-8;");
  }
  global.CalculadoraAderenciaApp = { STORAGE_KEYS: STORAGE_KEYS, CRITERIOS: CRITERIOS, LIMIARES_ELIMINATORIOS: LIMIARES_ELIMINATORIOS, NOTAS_EXIGEM_JUSTIFICATIVA: NOTAS_EXIGEM_JUSTIFICATIVA, RUBRICS: RUBRICS, getBlankIndicador: getBlankIndicador, escapeHtml: escapeHtml, getState: getState, saveBaseState: saveBaseState, clearAll: clearAll, parseCsvContent: parseCsvContent, buildTemplateCsv: buildTemplateCsv, getRubricTooltip: getRubricTooltip, calcularIA: calcularIA, verificarPenalizacao: verificarPenalizacao, classificar: classificar, calcularSensibilidade: calcularSensibilidade, buildResultados: buildResultados, persistMetadados: persistMetadados, downloadFile: downloadFile, exportarCsv: exportarCsv, exportarJson: exportarJson };
})(window);
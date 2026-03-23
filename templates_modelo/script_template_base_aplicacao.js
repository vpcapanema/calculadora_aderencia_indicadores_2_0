(function () {
    "use strict";

    var iconSpritePath = "./app_template_icon_sprite.svg";

    var spinnerMarkup = [
        '<svg class="app-template-inline-icon app-template-inline-icon--spinner" viewBox="0 0 20 20" aria-hidden="true">',
        '<use href="' + iconSpritePath + '#app-icon-spinner"></use>',
        '</svg>'
    ].join("");

    function initFontAwesomeFallback() {
        var stylesheet = document.getElementById("fontawesomeStylesheet");

        if (!stylesheet) {
            return;
        }

        var fallbackHref = stylesheet.dataset.fallbackHref;

        if (!fallbackHref) {
            return;
        }

        function isFontAwesomeLoaded() {
            var probe = document.createElement("i");
            probe.className = "fas fa-landmark";
            probe.setAttribute("aria-hidden", "true");
            probe.style.position = "absolute";
            probe.style.visibility = "hidden";
            document.body.appendChild(probe);

            var fontFamily = window.getComputedStyle(probe).fontFamily || "";
            document.body.removeChild(probe);

            return fontFamily.toLowerCase().indexOf("font awesome") !== -1;
        }

        function applyFallback() {
            if (stylesheet.getAttribute("href") === fallbackHref) {
                return;
            }

            stylesheet.setAttribute("href", fallbackHref);

            window.setTimeout(function () {
                if (!isFontAwesomeLoaded()) {
                    window.console.warn(
                        "Font Awesome nao carregou no Live Server. Abra o projeto pela raiz ou ajuste a raiz do servidor para incluir /static/."
                    );
                }
            }, 250);
        }

        stylesheet.addEventListener("error", applyFallback);

        window.setTimeout(function () {
            if (!isFontAwesomeLoaded()) {
                applyFallback();
            }
        }, 250);
    }

    function initTemplateForm() {
        var form = document.getElementById("appTemplateForm");
        var feedback = document.getElementById("appTemplateFeedback");
        var submitButton = document.getElementById("btnAplicarTemplate");

        if (!form || !feedback || !submitButton) {
            return;
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            feedback.classList.add("sigma-hidden");
            feedback.textContent = "";

            if (!form.checkValidity()) {
                form.classList.add("was-validated");
                feedback.className = "app-template-feedback app-template-feedback--error";
                feedback.textContent = "Revise os campos obrigatórios antes de aplicar a base.";
                feedback.classList.remove("sigma-hidden");
                return;
            }

            submitButton.disabled = true;
            submitButton.dataset.originalLabel = submitButton.innerHTML;
            submitButton.innerHTML = spinnerMarkup + " Aplicando...";

            window.setTimeout(function () {
                submitButton.disabled = false;
                submitButton.innerHTML = submitButton.dataset.originalLabel || "Aplicar Template Base";
                feedback.className = "app-template-feedback app-template-feedback--success";
                feedback.textContent = "Template validado. Agora substitua os textos e componentes pelos conteúdos reais do módulo.";
                feedback.classList.remove("sigma-hidden");
            }, 650);
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initFontAwesomeFallback();
        initTemplateForm();
    });
})();

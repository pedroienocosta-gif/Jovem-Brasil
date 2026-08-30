/* Jovem Brasil — first-visit language chooser.
   Shows once, remembers the choice, never forces a redirect on a
   direct link someone was sent — the small EN/PT link in the header
   is always there if they change their mind. */
(function () {
  var KEY = "jb_lang";
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  if (stored) return;

  var parts = location.pathname.split("/").filter(Boolean);
  var inPt = parts[0] === "pt";
  var filename = parts[parts.length - 1];
  if (!filename || !/\.html?$/i.test(filename)) filename = "index.html";
  var ptHref = inPt ? null : "pt/" + filename;
  var enHref = inPt ? "../" + filename : null;

  function remember(lang) {
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }

  document.addEventListener("DOMContentLoaded", function () {
    var wrap = document.createElement("div");
    wrap.className = "lang-gate";
    wrap.innerHTML =
      '<div class="lang-gate-card">' +
        '<svg class="lang-gate-mark" viewBox="0 0 40 40" aria-hidden="true">' +
          '<circle cx="20" cy="20" r="20" fill="#009c3b"/>' +
          '<circle cx="20" cy="20" r="15" fill="#002776"/>' +
          '<circle cx="20" cy="20" r="15" fill="none" stroke="#ffd400" stroke-width="1.6"/>' +
          '<path d="M 0.0,-10.0 L 2.41,-3.32 L 9.51,-3.09 L 3.9,1.27 L 5.88,8.09 L 0.0,4.1 L -5.88,8.09 L -3.9,1.27 L -9.51,-3.09 L -2.41,-3.32 Z" fill="#ffffff" transform="translate(20,20) scale(0.82)"/>' +
        "</svg>" +
        '<p class="lang-gate-prompt">Escolha o idioma · Choose your language</p>' +
        '<div class="lang-gate-buttons">' +
          '<button type="button" class="button" data-lang="pt">Português</button>' +
          '<button type="button" class="button ghost" data-lang="en">English</button>' +
        "</div>" +
      "</div>";
    document.body.appendChild(wrap);

    wrap.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = btn.getAttribute("data-lang");
        remember(lang);
        var target = lang === "pt" ? ptHref : enHref;
        wrap.remove();
        if (target) location.href = target;
      });
    });
  });
})();

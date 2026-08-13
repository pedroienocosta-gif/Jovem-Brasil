/* Jovem Brasil — site behaviour */

(function () {
  var stillness = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Reveal on scroll */
  var targets = document.querySelectorAll(".reveal");
  if (!stillness && "IntersectionObserver" in window) {
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach(function (el) { obs.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add("in"); });
  }

  /* The banner across the sphere turns slowly as the page scrolls */
  var ribbon = document.getElementById("ribbon");
  if (ribbon && !stillness) {
    var queued = false;
    var turn = function () {
      var deg = window.scrollY * 0.05;
      ribbon.setAttribute("transform", "rotate(" + deg.toFixed(2) + ", 260, 260)");
      queued = false;
    };
    window.addEventListener("scroll", function () {
      if (!queued) { queued = true; window.requestAnimationFrame(turn); }
    }, { passive: true });
  }

  /* Publications */
  var page = document.getElementById("publications");
  if (!page) return;

  var data = window.JB_PAPERS || { topics: [], papers: [] };
  var topics = data.topics || [];
  var papers = (data.papers || []).slice().sort(function (a, b) {
    return String(b.year || "").localeCompare(String(a.year || ""));
  });

  var bar = document.getElementById("topics");
  var list = document.getElementById("list");
  var active = "all";

  function countIn(id) {
    return papers.filter(function (p) { return p.topic === id; }).length;
  }

  function topicName(id) {
    var name = "";
    topics.forEach(function (t) { if (t.id === id) name = t.name; });
    return name;
  }

  function makeButton(id, name, n) {
    var b = document.createElement("button");
    b.className = "topic";
    b.type = "button";
    b.setAttribute("aria-pressed", String(id === active));
    b.innerHTML = name + (n > 0 ? ' <span class="count">' + n + "</span>" : "");
    b.addEventListener("click", function () {
      active = id;
      bar.querySelectorAll(".topic").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", "true");
      draw();
    });
    return b;
  }

  function safe(s) { return String(s == null ? "" : s); }

  function draw() {
    var shown = active === "all" ? papers : papers.filter(function (p) { return p.topic === active; });
    list.innerHTML = "";

    if (!shown.length) {
      var empty = document.createElement("div");
      empty.className = "empty";
      empty.innerHTML =
        "<h3>Stay tuned</h3><p>" +
        (active === "all"
          ? "The first Jovem Brasil papers are in review. Once they clear it, they go up here as PDFs with the authors' names."
          : "Nothing published under " + topicName(active) + " yet. Papers appear here as PDFs once they clear review.") +
        "</p>";
      list.appendChild(empty);
      list.classList.remove("list");
      return;
    }

    list.classList.add("list");
    shown.forEach(function (p, i) {
      var item = document.createElement("article");
      item.className = "paper reveal";
      item.style.setProperty("--d", Math.min(i * 0.06, 0.3) + "s");

      var left = document.createElement("div");
      var name = topicName(p.topic);
      left.innerHTML =
        (name ? '<span class="tag">' + safe(name) + "</span>" : "") +
        "<h3>" + safe(p.title) + "</h3>" +
        '<p class="meta">' + safe((p.authors || []).join(", ")) + (p.year ? " · " + safe(p.year) : "") + "</p>";

      var toggle = document.createElement("button");
      toggle.className = "button ghost";
      toggle.type = "button";
      toggle.textContent = "Preview";
      toggle.setAttribute("aria-expanded", "false");

      var panel = document.createElement("div");
      panel.className = "preview";
      panel.hidden = true;

      var href = "papers/" + safe(p.file);
      /* Phone browsers mostly refuse to render a PDF in an iframe, so on narrow
         screens the preview is the abstract plus a link rather than a blank box. */
      var local = location.protocol === "file:";
      var embeddable = window.innerWidth >= 760 && !local;
      panel.innerHTML =
        (embeddable
          ? '<div class="viewer"><object data="' + href + '#view=FitH" type="application/pdf">' +
            '<iframe title="' + safe(p.title) + '" src="' + href + '#view=FitH" loading="lazy"></iframe></object></div>'
          : "") +
        '<div class="aside">' +
        (p.summary ? '<p class="note">' + safe(p.summary) + "</p>" : "") +
        '<a class="button" href="' + href + '" target="_blank" rel="noopener">' +
        (embeddable ? "Open the full PDF" : "Read the PDF") + "</a>" +
        (local ? '<p class="fallback">Opened from a folder, so the inline preview is off \u2014 browsers block framed local files. It works once the site is on a web address.</p>'
               : embeddable ? '<p class="fallback">Preview not loading? Open the PDF instead.</p>' : "") +
        "</div>";

      var checked = false;
      function checkFile() {
        if (checked || !embeddable) return;
        checked = true;
        fetch(href, { method: "HEAD" }).then(function (r) {
          if (!r.ok) throw new Error(r.status);
        }).catch(function () {
          var viewer = panel.querySelector(".viewer");
          if (viewer) {
            viewer.classList.add("missing");
            viewer.innerHTML = '<p>No file at <code>' + href + '</code>. Check that the PDF is in the ' +
              '<code>papers</code> folder under exactly that name.</p>';
          }
        });
      }

      toggle.addEventListener("click", function () {
        checkFile();
        var open = panel.hidden;
        panel.hidden = !open;
        if (!embeddable && open) { panel.classList.add("plain"); }
        toggle.textContent = open ? "Close preview" : "Preview";
        toggle.setAttribute("aria-expanded", String(open));
      });

      item.appendChild(left);
      item.appendChild(toggle);
      item.appendChild(panel);
      list.appendChild(item);
      requestAnimationFrame(function () { item.classList.add("in"); });
    });
  }

  bar.appendChild(makeButton("all", "All", papers.length));
  topics.forEach(function (t) { bar.appendChild(makeButton(t.id, t.name, countIn(t.id))); });
  draw();
})();

/* Site analytics slot (shared across EYEVUE sites).
 * Nothing loads and nothing is tracked until ONE token below is filled in.
 * GoatCounter: create a site at goatcounter.com, put its code here (e.g. "willitrunpower").
 *   GoatCounter records page views AND the affiliate/sponsor click events below.
 * Cloudflare Web Analytics: paste the site token. Page views only (Cloudflare has no custom events).
 */
(function () {
  var CONFIG = {
    goatcounterCode: "",
    cloudflareToken: ""
  };
  var d = document, w = window;
  function load(src, attrs) {
    var s = d.createElement("script"); s.async = true; s.src = src;
    for (var k in attrs) s.setAttribute(k, attrs[k]);
    d.head.appendChild(s);
  }
  if (CONFIG.goatcounterCode) load("https://gc.zgo.at/count.js", { "data-goatcounter": "https://" + CONFIG.goatcounterCode + ".goatcounter.com/count" });
  if (CONFIG.cloudflareToken) load("https://static.cloudflareinsights.com/beacon.min.js", { "data-cf-beacon": JSON.stringify({ token: CONFIG.cloudflareToken }) });
  function track(path, title) {
    try {
      if (w.goatcounter && w.goatcounter.count) w.goatcounter.count({ path: path, title: title || path, event: true });
      if (typeof w.gtag === "function") w.gtag("event", path.split("/")[0], { event_label: path });
      if (typeof w.plausible === "function") w.plausible(path.split("/")[0], { props: { target: path } });
    } catch (e) {}
  }
  w.siteTrack = track;
  d.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var label = (a.textContent || "").trim().slice(0, 80);
    var aff = a.getAttribute("data-aff");
    if (aff) { track("aff-" + aff + "/" + (a.getAttribute("data-aff-item") || "item") + location.pathname, label); return; }
    var sp = a.getAttribute("data-sponsor");
    if (sp !== null) track("sponsor-" + (sp || "link") + location.pathname, label);
  }, true);
})();

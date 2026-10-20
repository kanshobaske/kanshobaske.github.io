/*
 * data-files 属性で指定されたJavaScriptを順番に読み込む共通ローダーです。
 * 読み込みURLに毎回異なる値を付け、管理画面で保存したデータが古いキャッシュで表示されにくくします。
 */
(function () {
  "use strict";
  const loader = document.currentScript;
  if (!loader) return;
  const files = String(loader.dataset.files || "").split(",").map(function (file) {
    return file.trim();
  }).filter(Boolean);

  function showLoadError(file) {
    console.error("スクリプトを読み込めませんでした:", file);
    const status = document.getElementById("status");
    if (status) {
      status.textContent = "必要なファイルを読み込めませんでした（" + file + "）。ページを再読み込みしてください。";
      return;
    }
    document.querySelectorAll(".loading-message").forEach(function (message) {
      message.textContent = "ページのデータを読み込めませんでした。時間をおいて再読み込みしてください。";
    });
  }
  function loadNext(index) {
    if (index >= files.length) return;
    const file = files[index];
    const script = document.createElement("script");
    script.src = file + (file.indexOf("?") === -1 ? "?" : "&") + "v=" + Date.now();
    script.onload = function () { loadNext(index + 1); };
    script.onerror = function () { showLoadError(file); };
    document.body.appendChild(script);
  }
  loadNext(0);
})();

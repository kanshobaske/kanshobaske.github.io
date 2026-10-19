/*
 * ホームの写真プレビューと大会写真一覧で共通して使う処理です。
 */
(function () {
  "use strict";

  // 画像パスが空の項目を除き、実際に表示できる写真だけを残します。
  const items = (typeof galleryData !== "undefined" && Array.isArray(galleryData))
    ? galleryData.filter(function (item) {
        return item && typeof item.src === "string" && item.src.trim() !== "";
      })
    : [];

  // 文字をHTMLとして解釈しないよう textContent で表示用要素を作ります。
  function makeElement(tag, className, value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value) element.textContent = value;
    return element;
  }

  // ホームのプレビューと写真一覧の共通描画処理です。
  function render(container, entries) {
    container.replaceChildren();
    if (entries.length === 0) {
      const empty = makeElement(
        "p",
        "gallery-empty",
        "大会写真は準備中です。写真を登録すると、ここに表示されます。"
      );
      container.appendChild(empty);
      return;
    }

    entries.forEach(function (item) {
      const card = makeElement("article", "gallery-card");
      const image = document.createElement("img");
      image.className = "gallery-image";
      image.src = item.src;
      image.alt = item.title ? item.title + "の写真" : "バスケットボール部の活動写真";
      image.loading = "lazy";
      // ファイル名やパスが間違って画像を読み込めないときの処理です。
      image.onerror = function () {
        image.alt = "写真を読み込めませんでした。登録したファイル名を確認してください。";
        image.classList.add("gallery-image-error");
      };
      card.appendChild(image);

      const body = makeElement("div", "gallery-card-body");
      body.appendChild(makeElement("h3", "gallery-card-title", item.title || "活動写真"));
      if (item.date) body.appendChild(makeElement("p", "gallery-card-date", item.date));
      if (item.description) body.appendChild(makeElement("p", "gallery-card-description", item.description));
      card.appendChild(body);
      container.appendChild(card);
    });
  }

  // ホームには先頭3件、写真ページには全件を表示します。
  const homeGallery = document.getElementById("top-gallery-list");
  const fullGallery = document.getElementById("gallery-list");
  if (homeGallery) render(homeGallery, items.slice(0, 3));
  if (fullGallery) render(fullGallery, items);
})();

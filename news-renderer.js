/*
 * ホームとニュース一覧で共通して使うニュース表示処理です。
 * title/desc などは textContent で表示し、HTMLとして解釈させないようにしています。
 */
(function () {
  "use strict";

  // 元データをコピーして日付の新しい順に並べます。元の newsData 配列自体は変更しません。
  const items = (typeof newsData !== "undefined" && Array.isArray(newsData))
    ? newsData.slice().sort(function (a, b) {
        function toTime(value) {
          const normalized = String(value || "").replace(/\./g, "-");
          const date = new Date(normalized + "T00:00:00");
          return Number.isNaN(date.getTime()) ? 0 : date.getTime();
        }
        return toTime(b.date) - toTime(a.date);
      })
    : [];

  // HTML要素を作成し、テキストとして内容を追加する共通関数です。
  function addTextElement(parent, tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text || "";
    parent.appendChild(element);
    return element;
  }

  // 記事がないときに空欄ではなくメッセージを表示します。
  function renderEmpty(container, isList) {
    container.replaceChildren();
    const empty = document.createElement(isList ? "li" : "p");
    empty.className = "news-empty";
    empty.textContent = "現在、掲載中のニュースはありません。";
    container.appendChild(empty);
  }

  // ホーム用：新しい記事から最大3件だけ表示します。
  function renderHome(container) {
    container.replaceChildren();
    const latestItems = items.slice(0, 3);
    if (latestItems.length === 0) {
      renderEmpty(container, false);
      return;
    }

    latestItems.forEach(function (item) {
      const card = document.createElement("article");
      card.className = "card";

      addTextElement(card, "span", "news-date", item.date);
      const body = document.createElement("div");
      body.className = "card-content";
      addTextElement(body, "span", "news-category", item.category || "お知らせ");
      addTextElement(body, "h3", "", item.title || "（タイトル未設定）");
      addTextElement(body, "p", "", item.desc || "本文は準備中です。");
      card.appendChild(body);
      container.appendChild(card);
    });
  }

  // ニュースページ用：登録されている記事を全件表示します。
  function renderNewsList(container) {
    container.replaceChildren();
    if (items.length === 0) {
      renderEmpty(container, true);
      return;
    }

    items.forEach(function (item) {
      const listItem = document.createElement("li");
      addTextElement(listItem, "div", "news-date", item.date);
      addTextElement(listItem, "span", "news-category", item.category || "お知らせ");
      addTextElement(listItem, "h3", "news-list-title", item.title || "（タイトル未設定）");
      addTextElement(listItem, "p", "news-description", item.desc || "本文は準備中です。");
      container.appendChild(listItem);
    });
  }

  // 表示先の要素があるページだけ描画し、ホームとニュース一覧の両方で同じ処理を使います。
  const homeContainer = document.getElementById("top-news-list");
  const newsListContainer = document.getElementById("news-container");
  if (homeContainer) renderHome(homeContainer);
  if (newsListContainer) renderNewsList(newsListContainer);
})();

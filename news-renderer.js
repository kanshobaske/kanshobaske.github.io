/*
 * ホームとニュース一覧で共通して使うニュース表示処理です。
 * お知らせはすべて news-data.js に固定記事として登録します。
 * このファイルでは大会予定からニュースを自動作成しません。
 */
(function () {
  "use strict";

  // 日付文字列を検証し、問題がなければDateに変換します。
  function parseDate(value) {
    const normalized = String(value || "").replace(/\./g, "-");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return null;
    const parsed = new Date(normalized + "T00:00:00");
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  // news-data.js の記事をコピーして掲載日が新しい順に並べます。
  // 元データの文章・掲載日は自動で変更せず、登録した内容をそのまま使います。
  const items = (typeof newsData !== "undefined" && Array.isArray(newsData))
    ? newsData.slice().sort(function (a, b) {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return (dateB ? dateB.getTime() : 0) - (dateA ? dateA.getTime() : 0);
      })
    : [];

  // HTML要素を作成し、お知らせ文はHTMLではなく通常のテキストとして表示します。
  function addTextElement(parent, tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text || "";
    parent.appendChild(element);
    return element;
  }

  // お知らせがないときは、空欄ではなくメッセージを表示します。
  function renderEmpty(container, isList) {
    container.replaceChildren();
    const empty = document.createElement(isList ? "li" : "p");
    empty.className = "news-empty";
    empty.textContent = "現在、掲載中のお知らせはありません。";
    container.appendChild(empty);
  }

  // ホーム用：登録されたお知らせから新しいものを最大3件表示します。
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

  // ニュースページ用：news-data.js に登録されている記事を全件表示します。
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

  // 表示先があるページだけを描画し、ホームとニュース一覧で同じロジックを使います。
  const homeContainer = document.getElementById("top-news-list");
  const newsListContainer = document.getElementById("news-container");
  if (homeContainer) renderHome(homeContainer);
  if (newsListContainer) renderNewsList(newsListContainer);
})();

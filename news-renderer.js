/*
 * ホームとニュース一覧で共通して使うニュース表示処理です。
 * 手動のお知らせは news-data.js、大会予定から作るお知らせは schedule-data.js を元データにします。
 * そのため、管理画面で大会日程を変更すると「試合予定のお知らせ」も自動で更新されます。
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

  // お知らせの掲載日を YYYY.MM.DD 形式にします。
  function formatDate(date) {
    return date.getFullYear() + "." +
      String(date.getMonth() + 1).padStart(2, "0") + "." +
      String(date.getDate()).padStart(2, "0");
  }

  // 大会の開始日・終了日と曜日を、お知らせに読みやすく表示します。
  function formatScheduleRange(item, start, end) {
    let text = start.getFullYear() + "年" +
      (start.getMonth() + 1) + "月" + start.getDate() + "日";
    if (end && end.getTime() > start.getTime()) {
      const endText = end.getFullYear() === start.getFullYear()
        ? (end.getMonth() + 1) + "月" + end.getDate() + "日"
        : end.getFullYear() + "年" + (end.getMonth() + 1) + "月" + end.getDate() + "日";
      text += "〜" + endText;
    }
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    text += "（" + (item.dayOfWeek || weekdays[start.getDay()]) + "）";
    return text;
  }

  // 大会予定に登録済みの試合だけを対象にし、開催3日前から当日までお知らせを表示します。
  // 新しい大会予定を勝手に追加せず、schedule-data.js の内容をそのまま利用します。
  function makeUpcomingScheduleNews() {
    if (typeof scheduleData === "undefined" || !Array.isArray(scheduleData)) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const noticeLeadDays = 3;

    return scheduleData.filter(function (item) {
      // 結果が登録済みの試合は、予定のお知らせの対象外です。
      if (String(item.result || "").trim()) return false;

      const start = parseDate(item.fullDate);
      const end = parseDate(item.endDate || item.fullDate);
      if (!start || !end) return false;

      // 大会開始日の3日前から当日までに限り、お知らせを表示します。
      const noticeStart = new Date(start);
      noticeStart.setDate(noticeStart.getDate() - noticeLeadDays);
      return today >= noticeStart && today <= end;
    }).map(function (item) {
      const start = parseDate(item.fullDate);
      const end = parseDate(item.endDate || item.fullDate);
      const dateText = formatScheduleRange(item, start, end);
      const knownDetails = [];

      if (item.opponent && item.opponent !== "未定" && item.opponent !== "組み合わせ発表後に更新") {
        knownDetails.push("対戦相手：" + item.opponent);
      }
      if (item.time) knownDetails.push("開始時刻：" + item.time);
      if (item.place) knownDetails.push("会場：" + item.place);

      return {
        // お知らせの日付は、実際に表示される当日の日付です。
        date: formatDate(today),
        category: "大会予定",
        title: "【大会予定】" + (item.title || "大会") + "が近づいています",
        desc: "開催予定：" + dateText + "。" +
          (knownDetails.length ? knownDetails.join("、") + "。" : "") +
          (item.comment || "詳しい日程は大会予定ページをご確認ください。")
      };
    });
  }

  // 手動のお知らせと日程から自動生成した予定を結合し、新しい順に並べます。
  const manualItems = (typeof newsData !== "undefined" && Array.isArray(newsData))
    ? newsData.slice()
    : [];
  const items = manualItems.concat(makeUpcomingScheduleNews()).sort(function (a, b) {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    return (dateB ? dateB.getTime() : 0) - (dateA ? dateA.getTime() : 0);
  });

  // 表示要素を作成し、お知らせ文はHTMLではなく通常のテキストとして表示します。
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

  // ホーム用：新しいお知らせから最大3件を表示します。
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

  // ニュースページ用：手動のお知らせと自動の試合予定をすべて表示します。
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

// ホームの簡易予定表を作ります。日付が不正な項目は表示対象から除外します。
  // 今後の予定のみを表示し、データに問題があってもページ全体が停止しないようにします。
  (function () {
    const tableBody = document.getElementById("top-schedule-list");
    if (!tableBody) return;

    function showMessage(message) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 3;
      cell.textContent = message;
      row.appendChild(cell);
      tableBody.appendChild(row);
    }

    if (typeof scheduleData === "undefined" || !Array.isArray(scheduleData)) {
      showMessage("予定を読み込めませんでした。時間をおいて再度ご確認ください。");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = scheduleData.filter(function (item) {
      const normalized = String(item.fullDate || "").replace(/\./g, "-");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return false;
      const eventDate = new Date(normalized + "T00:00:00");
      return !Number.isNaN(eventDate.getTime()) && eventDate >= today;
    }).sort(function (a, b) {
      return String(b.fullDate || "").localeCompare(String(a.fullDate || ""));
    });

    if (upcoming.length === 0) {
      showMessage("現在、掲載中の今後の予定はありません。");
      return;
    }

    upcoming.forEach(function (item) {
      const row = document.createElement("tr");
      const dateCell = document.createElement("td");
      const titleCell = document.createElement("td");
      const opponentCell = document.createElement("td");
      const badge = document.createElement("span");

      dateCell.textContent = [item.date, item.dayOfWeek ? "(" + item.dayOfWeek + ")" : ""].filter(Boolean).join(" ");
      badge.className = "schedule-inline-badge " + (item.badgeType === "official-game" ? "official" : "practice");
      badge.textContent = "[" + (item.badgeName || "予定") + "]";
      titleCell.appendChild(badge);
      titleCell.appendChild(document.createTextNode(" " + (item.title || "詳細未定")));
      opponentCell.textContent = item.opponent || "未定";
      row.append(dateCell, titleCell, opponentCell);
      tableBody.appendChild(row);
    });
  })();

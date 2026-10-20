(function () {
    "use strict";

// ページのHTMLが読み込まれてから、予定一覧・絞り込み・カレンダーを初期化します。
function initializeSchedulePage() {
    // allEvents：カレンダーに表示する予定日と予定名を保存します。
    // currentFilter：一覧・カレンダーに表示する種別（すべて／公式戦／練習試合）です。
    const allEvents = {};
    let currentFilter = "all";
    const scheduleList = document.getElementById("schedule-list");

    // schedule-data.js を元に、予定カードを自動生成します。
    function makeTextElement(tag, className, value) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        element.textContent = value || "";
        return element;
    }

    if (typeof scheduleData !== "undefined" && Array.isArray(scheduleData)) {
        scheduleList.replaceChildren();
        scheduleData.slice().sort(function (a, b) {
            return String(b.fullDate || "").localeCompare(String(a.fullDate || ""));
        }).forEach(function (item) {
            const normalizedDate = String(item.fullDate || "").replace(/\./g, "-");
            if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) return;

            const isOfficial = item.badgeType === "official-game";
            const type = isOfficial ? "official" : "practice";
            const title = item.title || "予定";
            const card = document.createElement("article");
            card.className = "schedule-card";
            card.id = "card-" + normalizedDate;
            card.setAttribute("data-date", normalizedDate);
            card.setAttribute("data-type", type);
            card.setAttribute("data-name", title);

            const header = document.createElement("div");
            header.className = "card-header";
            const dateLabel = document.createElement("span");
            dateLabel.className = "schedule-date";
            // 開始日と終了日を使い、複数日大会は日付の範囲で表示します。
            const dateObject = new Date(normalizedDate + "T12:00:00");
            const endNormalizedDate = String(item.endDate || "").replace(/\./g, "-");
            const endDateObject = /^\d{4}-\d{2}-\d{2}$/.test(endNormalizedDate)
                ? new Date(endNormalizedDate + "T12:00:00")
                : null;
            let dateText = dateObject.getFullYear() + "年" + (dateObject.getMonth() + 1) + "月" + dateObject.getDate() + "日";
            if (endDateObject && endDateObject >= dateObject) {
                const endText = endDateObject.getFullYear() === dateObject.getFullYear()
                    ? (endDateObject.getMonth() + 1) + "月" + endDateObject.getDate() + "日"
                    : endDateObject.getFullYear() + "年" + (endDateObject.getMonth() + 1) + "月" + endDateObject.getDate() + "日";
                dateText += "〜" + endText;
            }
            dateLabel.appendChild(document.createTextNode(dateText + " "));
            const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
            const weekdayText = item.dayOfWeek || weekdays[dateObject.getDay()];
            dateLabel.appendChild(makeTextElement("span", "", "（" + weekdayText + "）"));
            const badge = makeTextElement("span", "badge " + (isOfficial ? "official-game" : "practice-game"), item.badgeName || (isOfficial ? "公式戦" : "練習試合"));
            header.append(dateLabel, badge);
            card.appendChild(header);
            card.appendChild(makeTextElement("h3", "schedule-name", title));

            const detail = document.createElement("div");
            detail.className = "schedule-detail";
            const dl = document.createElement("dl");
            [["対戦相手", item.opponent || ""], ["試合結果", item.result || ""], ["時間", item.time || ""], ["会場", item.place || ""]].forEach(function (pair) {
                if (!pair[1]) return;
                dl.appendChild(makeTextElement("dt", "", pair[0]));
                dl.appendChild(makeTextElement("dd", "", pair[1]));
            });
            detail.appendChild(dl);
            if (item.comment) detail.appendChild(makeTextElement("p", "schedule-comment", item.comment));
            card.appendChild(detail);
            scheduleList.appendChild(card);
            // カレンダーの予定ボタンを押したときに、このカードへ移動できるように開始日を保存します。
            allEvents[normalizedDate] = { type: type, name: title, gotoDate: normalizedDate };

            // 終了日が指定されている大会は、その期間内の日付すべてにカレンダーの印を表示します。
            if (endDateObject && endDateObject > dateObject) {
                const rangeDate = new Date(dateObject);
                rangeDate.setDate(rangeDate.getDate() + 1);
                while (rangeDate <= endDateObject) {
                    const rangeKey = rangeDate.getFullYear() + "-" +
                        String(rangeDate.getMonth() + 1).padStart(2, "0") + "-" +
                        String(rangeDate.getDate()).padStart(2, "0");
                    allEvents[rangeKey] = { type: type, name: title, gotoDate: normalizedDate };
                    rangeDate.setDate(rangeDate.getDate() + 1);
                }
            }
        });
        if (!scheduleList.children.length) {
            scheduleList.appendChild(makeTextElement("p", "", "登録されている大会予定はありません。"));
        }
    } else {
        scheduleList.textContent = "大会予定を読み込めませんでした。";
    }

    // 選択中の種別に合わせ、カレンダーへ渡す予定だけを取り出します。
    function getFilteredEvents() {
        if (currentFilter === "all") return allEvents;
        const filtered = {};
        Object.keys(allEvents).forEach(function (date) {
            if (allEvents[date].type === currentFilter) {
                filtered[date] = allEvents[date];
            }
        });
        return filtered;
    }

    const today = new Date();
    let currentDate = new Date(today.getFullYear(), today.getMonth(), 1);

    // フィルターボタンのクリック処理
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", function() {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            this.classList.add("active");

            currentFilter = this.getAttribute("data-filter");

            document.querySelectorAll(".schedule-card").forEach(card => {
                const type = card.getAttribute("data-type");
                if (currentFilter === "all" || type === currentFilter) {
                    card.classList.remove("filtered-out");
                } else {
                    card.classList.add("filtered-out");
                }
            });

            setupSlider(currentDate);
        });
    });

    // カレンダー内のバッジがクリックされた時の処理
    document.addEventListener("click", function(e) {
        if (e.target.classList.contains("event-dot")) {
            const targetDate = e.target.getAttribute("data-goto");
            const targetCard = document.getElementById(`card-${targetDate}`);
            
            if (targetCard) {
                targetCard.scrollIntoView({ behavior: "smooth", block: "start" });
                targetCard.classList.add("highlight-flash");
                setTimeout(() => {
                    targetCard.classList.remove("highlight-flash");
                }, 1500);
            }
        }
    });

    // 予定名をHTMLとして誤って解釈しないようにエスケープします。
    function escapeCalendarText(value) {
        return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    // 単一の月テーブルのHTMLを生成する関数
    // 1か月分のカレンダーをHTML文字列に変換します。予定のない日には赤丸や試合名を付けません。
    function createCalendarHTML(year, month) {
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        const prevLastDate = new Date(year, month, 0).getDate();
        const activeEvents = getFilteredEvents();

        const tYear = today.getFullYear();
        const tMonth = today.getMonth();
        const tDate = today.getDate();

        let html = '<table class="calendar-table"><tbody>';
        let dayCount = 1;
        let nextMonthDayCount = 1;

        for (let i = 0; i < 6; i++) {
            if (dayCount > lastDate && i >= 4) break;
            html += "<tr>";

            for (let j = 0; j < 7; j++) {
                let cellClass = "";
                let printDay = "";
                let fullDateStr = "";

                if (i === 0 && j < firstDay) {
                    printDay = prevLastDate - firstDay + j + 1;
                    cellClass = "other-month";
                } else if (dayCount > lastDate) {
                    printDay = nextMonthDayCount++;
                    cellClass = "other-month";
                } else {
                    printDay = dayCount;
                    const mStr = String(month + 1).padStart(2, '0');
                    const dStr = String(dayCount).padStart(2, '0');
                    fullDateStr = `${year}-${mStr}-${dStr}`;
                    
                    // 今日の日付でも、予定が登録されていなければ赤丸を表示しません。
                    // allEvents はカレンダーの絞り込みに関係なく、全ての予定日を保持しています。
                    if (
                        year === tYear &&
                        month === tMonth &&
                        printDay === tDate &&
                        allEvents[fullDateStr]
                    ) {
                        cellClass += " is-today";
                    }
                    
                    dayCount++;
                }

                html += `<td class="${cellClass.trim()}"><span class="day-num">${printDay}</span>`;
                
                if (fullDateStr && activeEvents[fullDateStr]) {
                    const ev = activeEvents[fullDateStr];
                    // 複数日大会の場合、どの日のボタンからでも開始日の予定カードへ移動します。
                    html += `<div class="event-wrapper"><button class="event-dot ${ev.type}" data-goto="${ev.gotoDate || fullDateStr}">${escapeCalendarText(ev.name)}</button></div>`;
                }
                html += "</td>";
            }
            html += "</tr>";
        }
        html += "</tbody></table>";
        return html;
    }

    // 表示月と、その前後の月のカレンダーをセットします。
    function setupSlider(baseDate) {
        const year = baseDate.getFullYear();
        const month = baseDate.getMonth();

        document.getElementById("calendar-title").textContent = `${year}年 ${month + 1}月`;

        const prevDate = new Date(year, month - 1, 1);
        const nextDate = new Date(year, month + 1, 1);

        document.getElementById("cal-prev-box").innerHTML = createCalendarHTML(prevDate.getFullYear(), prevDate.getMonth());
        document.getElementById("cal-current-box").innerHTML = createCalendarHTML(year, month);
        document.getElementById("cal-next-box").innerHTML = createCalendarHTML(nextDate.getFullYear(), nextDate.getMonth());
    }

    setupSlider(currentDate);

    const track = document.getElementById("calendar-track");
    let isTransitioning = false;

    // 「先月」ボタン：アニメーションの後に表示月を1か月戻します。
    document.getElementById("prev-btn").addEventListener("click", function() {
        if (isTransitioning) return;
        isTransitioning = true;

        track.classList.add("is-animating");
        track.style.transform = "translateX(0%)";

        setTimeout(() => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            track.classList.remove("is-animating");
            track.style.transform = "translateX(-33.3333%)";
            setupSlider(currentDate);
            isTransitioning = false;
        }, 400);
    });

    // 「次月」ボタン：アニメーションの後に表示月を1か月進めます。
    document.getElementById("next-btn").addEventListener("click", function() {
        if (isTransitioning) return;
        isTransitioning = true;

        track.classList.add("is-animating");
        track.style.transform = "translateX(-66.6666%)";

        setTimeout(() => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            track.classList.remove("is-animating");
            track.style.transform = "translateX(-33.3333%)";
            setupSlider(currentDate);
            isTransitioning = false;
        }, 400);
    });

    // 表示領域に入ったカードを表示状態にして、スクロール時のアニメーションを行います。
    const targets = document.querySelectorAll(".schedule-card, .calendar-section");

    // IntersectionObserverが使えない環境でも、予定が透明なまま隠れないようにします。
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-show");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: "0px 0px -10% 0px",
            threshold: 0
        });

        targets.forEach((target, index) => {
            target.style.transitionDelay = `${index * 0.25}s`;
            observer.observe(target);
        });
    } else {
        targets.forEach((target) => target.classList.add("is-show"));
    }
}

// 外部スクリプトが遅れて読み込まれても初期化が実行されるようにします。
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeSchedulePage, { once: true });
} else {
    initializeSchedulePage();
}

})();

// 大会予定・試合結果データです。ホームの予定表、月別カレンダー、試合一覧、管理画面で共通利用します。
// date＝表示用の日付、fullDate＝判定用の日付（YYYY.MM.DD）、dayOfWeek＝曜日です。
// badgeType＝公式戦か練習試合か、badgeName＝画面に表示する分類、title＝大会名・回戦です。
// opponent＝対戦相手、result＝スコア（未確定・予定なら空欄）、time＝開始時刻、place＝会場、comment＝補足です。
// 新しい予定や結果を追加する場合は、下のオブジェクトを1件コピーし、カンマや波括弧を残してください。
const scheduleData = [
  // 春季選手権大会の結果：日時とスコアは登録された情報に基づいています。
  {
    "date": "4/18",
    "fullDate": "2026.04.18",
    "dayOfWeek": "土",
    "badgeType": "official-game",
    "badgeName": "公式戦",
    "title": "長崎県高校バスケットボール春季選手権大会（2回戦）",
    "opponent": "大村",
    "result": "大村 143-29 諫早商",
    "time": "16:00",
    "place": "",
    "comment": ""
  },
  // ウィンターカップ県予選の結果：日時とスコアは登録された情報に基づいています。
  {
    "date": "10/10",
    "fullDate": "2026.10.10",
    "dayOfWeek": "土",
    "badgeType": "official-game",
    "badgeName": "公式戦",
    "title": "ウィンターカップ長崎県予選（1回戦）",
    "opponent": "九州文化学園",
    "result": "諫早商 69-79 九州文化学園",
    "time": "11:30",
    "place": "",
    "comment": ""
  },
  // 長崎県高体連の予定表に基づく中地区新人大会です。個別の対戦日時は組み合わせ発表後に更新します。
  {
    "date": "11/21〜22",
    "fullDate": "2026.11.21",
    "endDate": "2026.11.22",
    "dayOfWeek": "土〜日",
    "badgeType": "official-game",
    "badgeName": "大会予定",
    "title": "長崎県高等学校新人体育大会 中地区大会（予定）",
    "opponent": "組み合わせ発表後に更新",
    "result": "",
    "time": "",
    "place": "",
    "comment": "大会全体は11月21日（土）〜22日（日）開催予定です。諫早商の試合日・対戦相手・開始時刻・会場は、組み合わせ発表後に更新します。"
  }
];

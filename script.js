const days = ["日", "月", "火", "水", "木", "金", "土"]; // 曜日の配列を作る

const today = new Date(); // 今日の日付を取得する

const startDate = getStartOfCurrentWeek(today); // 現在の週の日曜日を開始日にする

const weekCount = 20; // 表示する週数を設定する

const states = ["none", "1", "2", "3", "4", "5"]; // クリックで切り替わる欠席状態を設定する

let periodCount = Number(localStorage.getItem("periodCount")) || 4; // 保存済みの時限数を取得し、なければ4限にする

if (periodCount < 4) { // 時限数が4未満の場合
  periodCount = 4; // 最低でも4限に戻す
}

let isEditMode = false; // 授業名編集モードかどうかを保存する

const absenceData = JSON.parse(localStorage.getItem("absenceData")) || {}; // 保存済みの欠席色データを読み込む

const subjectData = JSON.parse(localStorage.getItem("subjectData")) || {}; // 保存済みの授業名データを読み込む

const calendar = document.getElementById("calendar"); // カレンダーを表示する場所を取得する

const editButton = document.getElementById("editButton"); // 編集モード切り替えボタンを取得する

const addPeriodButton = document.getElementById("addPeriodButton"); // 時限追加ボタンを取得する

const deletePeriodButton = document.getElementById("deletePeriodButton"); // 時限削除ボタンを取得する

const resetAbsenceButton = document.getElementById("resetAbsenceButton"); // 欠席色リセットボタンを取得する

const resetSubjectButton = document.getElementById("resetSubjectButton"); // 授業名リセットボタンを取得する

const modeText = document.getElementById("modeText"); // モード説明文を取得する

editButton.addEventListener("click", toggleEditMode); // 編集モードボタンにクリック処理をつける

addPeriodButton.addEventListener("click", addPeriod); // 時限追加ボタンにクリック処理をつける

deletePeriodButton.addEventListener("click", deletePeriod); // 時限削除ボタンにクリック処理をつける

resetAbsenceButton.addEventListener("click", resetAbsenceData); // 欠席色リセットボタンにクリック処理をつける

resetSubjectButton.addEventListener("click", resetSubjectData); // 授業名リセットボタンにクリック処理をつける

createCalendar(); // カレンダーを作成する

function createCalendar() { // カレンダーを作る関数

  calendar.innerHTML = ""; // すでに表示されているカレンダーを空にする

  for (let weekIndex = 0; weekIndex < weekCount; weekIndex++) { // 表示する週数だけ繰り返す

    const weekStart = new Date(startDate); // その週の開始日を作る

    weekStart.setDate(startDate.getDate() + weekIndex * 7); // 週番号に合わせて開始日を進める

    const weekEnd = new Date(weekStart); // その週の終了日を作る

    weekEnd.setDate(weekStart.getDate() + 6); // 開始日から6日後を終了日にする

    const weekDiv = document.createElement("div"); // 1週間分の箱を作る

    weekDiv.className = "week"; // weekクラスをつける

    const weekTitle = document.createElement("div"); // 週タイトルを作る

    weekTitle.className = "week-title"; // week-titleクラスをつける

    weekTitle.textContent = `${formatDate(weekStart)}〜${formatDate(weekEnd)}`; // 日付範囲だけ表示する

    weekDiv.appendChild(weekTitle); // 週の箱に日付範囲を追加する

    const weekScroll = document.createElement("div"); // スマホ用の横スクロール箱を作る

    weekScroll.className = "week-scroll"; // week-scrollクラスをつける

    const grid = document.createElement("div"); // カレンダー表の箱を作る

    grid.className = "calendar-grid"; // calendar-gridクラスをつける

    grid.style.gridTemplateRows = `55px repeat(${periodCount}, 58px)`; // 時限数に合わせて行数を増やす

    const corner = document.createElement("div"); // 左上の空白マスを作る

    corner.className = "corner"; // cornerクラスをつける

    grid.appendChild(corner); // 表に左上の空白マスを追加する

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) { // 日曜から土曜まで繰り返す

      const currentDate = new Date(weekStart); // その週の開始日をコピーする

      currentDate.setDate(weekStart.getDate() + dayIndex); // 曜日に合わせて日付を進める

      const dayHeader = document.createElement("div"); // 曜日ヘッダーを作る

      dayHeader.className = "day-header"; // day-headerクラスをつける

      dayHeader.innerHTML = `${days[dayIndex]}<div class="date">${currentDate.getMonth() + 1}/${currentDate.getDate()}</div>`; // 曜日と月日を表示する

      grid.appendChild(dayHeader); // 表に曜日ヘッダーを追加する

    }

    for (let period = 1; period <= periodCount; period++) { // 現在の時限数まで繰り返す

      const periodLabel = document.createElement("div"); // 左側の時限ラベルを作る

      periodLabel.className = "period-label"; // period-labelクラスをつける

      periodLabel.textContent = `${period}限`; // 何限かを表示する

      grid.appendChild(periodLabel); // 表に時限ラベルを追加する

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) { // 日曜から土曜まで繰り返す

        const cell = document.createElement("div"); // 授業ボックスを作る

        cell.className = "cell"; // cellクラスをつける

        cell.dataset.day = dayIndex; // 何曜日かを保存する

        cell.dataset.period = period; // 何限かを保存する

        cell.addEventListener("click", () => { // ボックスがクリックされたとき

          handleCellClick(dayIndex, period); // モードに応じた処理を実行する

        });

        grid.appendChild(cell); // 表に授業ボックスを追加する

      }

    }

    weekScroll.appendChild(grid); // 横スクロール箱に表を入れる

    weekDiv.appendChild(weekScroll); // 週の箱に横スクロール箱を追加する

    calendar.appendChild(weekDiv); // カレンダー全体に週を追加する

  }

  updateAllCells(); // 保存済みデータを画面に反映する

}

function addPeriod() { // 時限を追加する関数

  periodCount++; // 時限数を1つ増やす

  localStorage.setItem("periodCount", periodCount); // 増やした時限数を保存する

  createCalendar(); // カレンダーを作り直す

}

function deletePeriod() { // 時限を削除する関数

  if (periodCount <= 4) { // 4限以下の場合

    alert("4限未満にはできません。"); // 削除できないことを伝える

    return; // 処理を終了する

  }

  const targetPeriod = periodCount; // 削除対象を最後の時限にする

  const result = confirm(`${targetPeriod}限を削除しますか？この時限の授業名と欠席色も消えます。`); // 確認メッセージを出す

  if (!result) { // キャンセルされた場合

    return; // 処理を終了する

  }

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) { // 日曜から土曜まで繰り返す

    const key = `${dayIndex}-${targetPeriod}`; // 削除対象のキーを作る

    delete absenceData[key]; // 削除する時限の欠席色データを消す

    delete subjectData[key]; // 削除する時限の授業名データを消す

  }

  periodCount--; // 時限数を1つ減らす

  localStorage.setItem("periodCount", periodCount); // 減らした時限数を保存する

  localStorage.setItem("absenceData", JSON.stringify(absenceData)); // 欠席色データを保存し直す

  localStorage.setItem("subjectData", JSON.stringify(subjectData)); // 授業名データを保存し直す

  createCalendar(); // カレンダーを作り直す

}

function handleCellClick(dayIndex, period) { // ボックスクリック時の処理を分ける関数

  if (isEditMode) { // 授業名編集モードの場合

    editSubject(dayIndex, period); // 授業名を編集する

  } else { // 通常モードの場合

    changeAbsenceState(dayIndex, period); // 欠席色を変更する

  }

}

function editSubject(dayIndex, period) { // 授業名を編集する関数

  const key = `${dayIndex}-${period}`; // 曜日と時限を組み合わせたキーを作る

  const currentSubject = subjectData[key] || ""; // 現在の授業名を取得する

  const newSubject = prompt("授業名を入力してください。空欄にすると削除されます。", currentSubject); // 授業名を入力させる

  if (newSubject === null) { // キャンセルが押された場合

    return; // 何も変更せずに終了する

  }

  subjectData[key] = newSubject.trim(); // 入力された授業名を保存する

  localStorage.setItem("subjectData", JSON.stringify(subjectData)); // 授業名データをブラウザに保存する

  updateCells(dayIndex, period); // 同じ曜日・同じ限の全週ボックスを更新する

}

function changeAbsenceState(dayIndex, period) { // 欠席色を切り替える関数

  const key = `${dayIndex}-${period}`; // 曜日と時限を組み合わせたキーを作る

  const currentState = absenceData[key] || "none"; // 現在の欠席状態を取得する

  const currentIndex = states.includes(currentState) ? states.indexOf(currentState) : 0; // 不正な状態なら未設定として扱う

  const nextIndex = (currentIndex + 1) % states.length; // 次の状態の番号を計算する

  const nextState = states[nextIndex]; // 次の状態を取得する

  absenceData[key] = nextState; // 新しい欠席状態を保存する

  localStorage.setItem("absenceData", JSON.stringify(absenceData)); // 欠席色データをブラウザに保存する

  updateCells(dayIndex, period); // 同じ曜日・同じ限の全週ボックスを更新する

}

function updateCells(dayIndex, period) { // 同じ曜日・同じ限のボックスを更新する関数

  const key = `${dayIndex}-${period}`; // 曜日と時限のキーを作る

  const state = absenceData[key] || "none"; // 欠席状態を取得する

  const subject = subjectData[key] || ""; // 授業名を取得する

  const cells = document.querySelectorAll(`.cell[data-day="${dayIndex}"][data-period="${period}"]`); // 同じ曜日・同じ限のボックスを全て取得する

  cells.forEach(cell => { // 取得したボックスを1つずつ処理する

    cell.classList.remove("state-none", "state-1", "state-2", "state-3", "state-4", "state-5"); // 古い色クラスを消す

    cell.classList.add(`state-${state}`); // 新しい色クラスをつける

    cell.textContent = subject; // ボックス内には授業名だけ表示する

  });

}

function updateAllCells() { // 全てのボックスを更新する関数

  for (let period = 1; period <= periodCount; period++) { // 現在の時限数まで繰り返す

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) { // 日曜から土曜まで繰り返す

      updateCells(dayIndex, period); // その曜日・時限のボックスを更新する

    }

  }

}

function toggleEditMode() { // 授業名編集モードを切り替える関数

  isEditMode = !isEditMode; // trueとfalseを切り替える

  if (isEditMode) { // 編集モードがONの場合

    editButton.textContent = "授業名編集モード：ON"; // ボタン表示をONにする

    editButton.classList.add("active"); // ボタンにactiveクラスをつける

    modeText.textContent = "授業名編集モード：ボックスをクリックすると授業名を設定できます"; // 説明文を変更する

  } else { // 編集モードがOFFの場合

    editButton.textContent = "授業名編集モード：OFF"; // ボタン表示をOFFにする

    editButton.classList.remove("active"); // activeクラスを外す

    modeText.textContent = "通常モード：クリックすると欠席回数の色が変わります"; // 説明文を戻す

  }

}

function resetAbsenceData() { // 欠席色を全リセットする関数

  const result = confirm("欠席色を全てリセットしますか？授業名は残ります。"); // 確認メッセージを出す

  if (!result) { // キャンセルされた場合

    return; // 処理を終了する

  }

  Object.keys(absenceData).forEach(key => { // 欠席データのキーを1つずつ処理する

    absenceData[key] = "none"; // 全て未設定に戻す

  });

  localStorage.setItem("absenceData", JSON.stringify(absenceData)); // リセット後の欠席色データを保存する

  updateAllCells(); // 画面を更新する

}

function resetSubjectData() { // 授業名を全リセットする関数

  const result = confirm("設定した授業名を全てリセットしますか？欠席色は残ります。"); // 確認メッセージを出す

  if (!result) { // キャンセルされた場合

    return; // 処理を終了する

  }

  Object.keys(subjectData).forEach(key => { // 授業名データのキーを1つずつ処理する

    delete subjectData[key]; // 授業名を削除する

  });

  localStorage.setItem("subjectData", JSON.stringify(subjectData)); // リセット後の授業名データを保存する

  updateAllCells(); // 画面を更新する

}

function getStartOfCurrentWeek(date) { // 現在の週の日曜日を取得する関数

  const start = new Date(date); // 受け取った日付をコピーする

  start.setHours(0, 0, 0, 0); // 時刻を0時0分0秒にする

  start.setDate(start.getDate() - start.getDay()); // 今日の曜日番号分だけ戻して日曜日にする

  return start; // 週の開始日を返す

}

function formatDate(date) { // 日付を「2026年6月3日」の形にする関数

  const year = date.getFullYear(); // 年を取得する

  const month = date.getMonth() + 1; // 月を取得する

  const day = date.getDate(); // 日を取得する

  return `${year}年${month}月${day}日`; // 表示用の文字を返す

}
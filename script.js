// script.js

// ---------------------------
// Toast消息提示模块
// ---------------------------
function playEffectAudio(src) {
  const audio = document.createElement('audio');
  audio.src = 'music/' + src;
  audio.style.display = 'none';
  audio.autoplay = true;
  audio.onended = () => audio.remove();
  document.body.appendChild(audio);
}

function showToast(msg) {
  let toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  document.body.appendChild(toast);
  if (msg === "任务完成，游戏胜利！") {
    playEffectAudio("success.mp3");
  } else if (msg === "任务失败！") {
    playEffectAudio("fail.mp3");
  }
  setTimeout(() => { toast.remove(); }, 1800);
}

// ---------------------------
// 数据管理模块
// ---------------------------
const GameData = {
  cache: null,
  get() {
    if (!this.cache) {
      try {
        this.cache = JSON.parse(localStorage.getItem("gameData"));
      } catch (e) {
        this.cache = null;
      }
    }
    return this.cache;
  },
  set(data) {
    this.cache = data;
    localStorage.setItem("gameData", JSON.stringify(data));
  },
  initialize() {
    if (!localStorage.getItem("gameData")) {
      const defaultData = {
        tasks: [
          { id: 1, name: "任务1" },
          { id: 2, name: "任务2" },
          { id: 3, name: "任务3" },
          { id: 4, name: "任务4" }
        ],
        coins: 0,
        lotteryChances: 0,
        score: 0,
        starRating: 0,
        cash: 0,
        energy: 5,
        consecutiveSignIn: 0,
        lotteryGuarantee: 0,
        lotteryCount: 0,
        lastSignInDate: null,
        lastRankReset: new Date().toISOString(),
        lastEnergyRecover: Date.now()
      };
      localStorage.setItem("gameData", JSON.stringify(defaultData));
      this.cache = defaultData;
    }
  }
};

// ---------------------------
// 段位系统
// ---------------------------
function getStarDisplay(stars) {
  let level = "";
  if (stars <= 3) level = "3⭐铜Ⅲ🥉";
  else if (stars <= 6) level = "6⭐青铜Ⅱ🥉";
  else if (stars <= 9) level = "9⭐青铜Ⅰ🥉";
  else if (stars <= 12) level = "12⭐白银Ⅲ🥈";
  else if (stars <= 15) level = "15⭐白银Ⅱ🥈";
  else if (stars <= 18) level = "18⭐白银Ⅰ🥈";
  else if (stars <= 22) level = "22⭐黄金Ⅳ🥇";
  else if (stars <= 26) level = "26⭐黄金Ⅲ🥇";
  else if (stars <= 30) level = "30⭐黄金Ⅱ🥇";
  else if (stars <= 34) level = "34⭐黄金Ⅰ🥇";
  else if (stars <= 38) level = "38⭐铂金Ⅳ🎖️";
  else if (stars <= 42) level = "42⭐铂金Ⅲ🎖️";
  else if (stars <= 46) level = "46⭐铂金Ⅱ🎖️";
  else if (stars <= 50) level = "50⭐铂金Ⅰ🎖️";
  else if (stars <= 55) level = "55⭐钻石Ⅴ🧱";
  else if (stars <= 60) level = "60⭐钻石Ⅳ🧱";
  else if (stars <= 65) level = "65⭐钻石Ⅲ🧱";
  else if (stars <= 70) level = "70⭐钻石Ⅱ🧱";
  else if (stars <= 75) level = "75⭐钻石Ⅰ🧱";
  else if (stars <= 80) level = "80⭐星耀Ⅴ🏅";
  else if (stars <= 85) level = "85⭐星耀Ⅳ🏅";
  else if (stars <= 90) level = "90⭐星耀Ⅲ🏅";
  else if (stars <= 95) level = "95⭐星耀Ⅱ🏅";
  else if (stars <= 100) level = "100⭐星耀Ⅰ🏅";
  else if (stars <= 109) level = "109⭐最强王者🏆";
  else if (stars <= 124) level = "124⭐非凡王者😠";
  else if (stars <= 134) level = "134⭐无双王者😡";
  else if (stars <= 149) level = "149⭐绝世王者👺";
  else if (stars <= 174) level = "174⭐至圣王者💀";
  else if (stars <= 199) level = "199⭐荣耀王者🫤";
  else level = "∞⭐传奇王者👹";
  return stars + "/" + level;
}

function checkAndResetRankSystem() {
  let data = GameData.get();
  let now = new Date().getTime();
  let lastReset = data.lastRankReset ? new Date(data.lastRankReset).getTime() : now;
  const threeMonths = 90 * 24 * 3600 * 1000;
  if (now - lastReset >= threeMonths) {
    data.starRating = 0;
    data.lastRankReset = new Date().toISOString();
    GameData.set(data);
    showToast("段位系统已自动重置！");
  }
}

// ---------------------------
// 体力值恢复机制（按时间戳计算）
// ---------------------------
function recoverEnergyOnLoad() {
  let data = GameData.get();
  const now = Date.now();
  if (!data.lastEnergyRecover) data.lastEnergyRecover = now;
  let hoursPassed = Math.floor((now - data.lastEnergyRecover) / 3600000);
  if (hoursPassed > 0 && data.energy < 5) {
    data.energy = Math.min(5, data.energy + hoursPassed);
    data.lastEnergyRecover = now;
    GameData.set(data);
    updateDashboard();
    updateDashboardTaskList();
  }
}

// ---------------------------
// 主界面数据看板
// ---------------------------
function updateDashboard() {
  const data = GameData.get();
  if (document.getElementById("taskCount"))
    document.getElementById("taskCount").textContent = data.tasks.length;
  if (document.getElementById("coins"))
    document.getElementById("coins").textContent = data.coins;
  if (document.getElementById("lotteryChances"))
    document.getElementById("lotteryChances").textContent = data.lotteryChances;
  if (document.getElementById("score"))
    document.getElementById("score").textContent = Math.min(data.score, 240);
  if (document.getElementById("starRating"))
    document.getElementById("starRating").textContent = getStarDisplay(data.starRating);
  if (document.getElementById("cash"))
    document.getElementById("cash").textContent = data.cash;
  if (document.getElementById("energy"))
    document.getElementById("energy").textContent = data.energy;
  if (document.getElementById("consecutiveSignIn"))
    document.getElementById("consecutiveSignIn").textContent = data.consecutiveSignIn;
  if (document.getElementById("lotteryGuarantee"))
    document.getElementById("lotteryGuarantee").textContent = data.lotteryGuarantee;
  if (document.getElementById("lotteryCount"))
    document.getElementById("lotteryCount").textContent = data.lotteryCount;
  if (document.getElementById("scoreProgressBar")) {
    let percent = Math.min(100, (data.score / 240) * 100);
    document.getElementById("scoreProgressBar").style.width = percent + "%";
    document.getElementById("scoreProgressBar").textContent = Math.min(data.score, 240) + "/240";
  }
  renderRankPanel();
}

// ---------------------------
// 主页任务栏展板
// ---------------------------
function updateDashboardTaskList() {
  let data = GameData.get();
  let panel = document.getElementById("dashboardTaskList");
  if (panel) {
    panel.innerHTML = "";
    data.tasks.forEach((task) => {
      let taskDiv = document.createElement("div");
      taskDiv.className = "taskItem";
      taskDiv.textContent = task.name;
      panel.appendChild(taskDiv);
    });
  }
}

// ---------------------------
// 重置数据
// ---------------------------
function resetGameData() {
  if (confirm("确定重置所有数据吗？此操作不可恢复！")) {
    localStorage.removeItem("gameData");
    GameData.cache = null;
    GameData.initialize();
    updateDashboard();
    updateDashboardTaskList();
    showToast("数据已重置");
  }
}

// ---------------------------
// 游戏流程：随机抽取任务
// ---------------------------
function startGame() {
  const data = GameData.get();
  if (data.energy <= 0) {
    showToast("体力值为0，无法开始游戏！");
    return;
  }
  if (data.tasks.length === 0) {
    showToast("当前无任务，请先添加任务！");
    return;
  }
  // 随机抽取一条任务
  const randomIndex = Math.floor(Math.random() * data.tasks.length);
  const selectedTask = data.tasks[randomIndex];
  localStorage.setItem("currentTask", JSON.stringify({
    id: selectedTask.id,
    name: selectedTask.name,
    index: randomIndex,
    startTime: Date.now()
  }));
  showToast("抽取到任务：" + selectedTask.name + "（展示5秒）");
  setTimeout(function () {
    window.location.href = "countdown.html";
  }, 5000);
}

// ---------------------------
// 倒计时模块
// ---------------------------
var countdownInterval;
function startCountdown() {
  let remainingTime = 30 * 60;
  updateTimerDisplay(remainingTime);
  countdownInterval = setInterval(function () {
    remainingTime--;
    updateTimerDisplay(remainingTime);
    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      gameFailed();
    }
  }, 1000);
}
function updateTimerDisplay(seconds) {
  let m = Math.floor(seconds / 60);
  let s = seconds % 60;
  let timeStr = (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
  if (document.getElementById("timerDisplay"))
    document.getElementById("timerDisplay").textContent = timeStr;
}

// 任务完成
function completeTask() {
  playEffectAudio("success.mp3");
  clearInterval(countdownInterval);
  let parts = document.getElementById("timerDisplay").textContent.split(":");
  let totalSeconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  let data = GameData.get();
  // 升段前段位
  let beforeStar = data.starRating;
  let beforeRank = getRankNameByStar(beforeStar);
  if (totalSeconds >= 15 * 60 && totalSeconds <= 30 * 60) {
    data.coins += 30;
    data.lotteryChances += 2;
    data.score += 30;
    data.starRating += 1;
  } else if (totalSeconds >= 5 * 60 && totalSeconds < 15 * 60) {
    data.coins += 20;
    data.lotteryChances += 1;
    data.score += 30;
    data.starRating += 1;
  } else if (totalSeconds >= 0 && totalSeconds < 5 * 60) {
    data.coins += 10;
    data.score += 30;
    data.starRating += 1;
  }
  data.score = Math.min(data.score, 240);
  GameData.set(data);
  // 升段后段位
  let afterStar = data.starRating;
  let afterRank = getRankNameByStar(afterStar);
  if (data.score >= 240) {
    data.score = data.score - 70;
    data.starRating += 1;
    GameData.set(data);
    afterStar = data.starRating;
    afterRank = getRankNameByStar(afterStar);
  }
  // 判断是否升段
  if (afterRank !== beforeRank) {
    localStorage.setItem('rankupInfo', JSON.stringify({ rank: afterRank }));
  }
  showToast("任务完成，游戏胜利！");
  removeCurrentTask();
  updateDashboard();
  updateDashboardTaskList();
  setTimeout(() => { window.location.href = "index.html"; }, 1200);
}

// 获取段位名
function getRankNameByStar(star) {
  const rankList = [
    { min: 0, max: 3, name: "铜Ⅲ" },
    { min: 4, max: 6, name: "青铜Ⅱ" },
    { min: 7, max: 9, name: "青铜Ⅰ" },
    { min: 10, max: 12, name: "白银Ⅲ" },
    { min: 13, max: 15, name: "白银Ⅱ" },
    { min: 16, max: 18, name: "白银Ⅰ" },
    { min: 19, max: 22, name: "黄金Ⅳ" },
    { min: 23, max: 26, name: "黄金Ⅲ" },
    { min: 27, max: 30, name: "黄金Ⅱ" },
    { min: 31, max: 34, name: "黄金Ⅰ" },
    { min: 35, max: 38, name: "铂金Ⅳ" },
    { min: 39, max: 42, name: "铂金Ⅲ" },
    { min: 43, max: 46, name: "铂金Ⅱ" },
    { min: 47, max: 50, name: "铂金Ⅰ" },
    { min: 51, max: 55, name: "钻石Ⅴ" },
    { min: 56, max: 60, name: "钻石Ⅳ" },
    { min: 61, max: 65, name: "钻石Ⅲ" },
    { min: 66, max: 70, name: "钻石Ⅱ" },
    { min: 71, max: 75, name: "钻石Ⅰ" },
    { min: 76, max: 80, name: "星耀Ⅴ" },
    { min: 81, max: 85, name: "星耀Ⅳ" },
    { min: 86, max: 90, name: "星耀Ⅲ" },
    { min: 91, max: 95, name: "星耀Ⅱ" },
    { min: 96, max: 100, name: "星耀Ⅰ" },
    { min: 101, max: 109, name: "最强王者" },
    { min: 110, max: 124, name: "非凡王者" },
    { min: 125, max: 134, name: "无双王者" },
    { min: 135, max: 149, name: "绝世王者" },
    { min: 150, max: 174, name: "至圣王者" },
    { min: 175, max: 199, name: "荣耀王者" },
    { min: 200, max: 9999, name: "传奇王者" }
  ];
  let rank = rankList.find(r => star >= r.min && star <= r.max) || rankList[rankList.length-1];
  return rank.name;
}

// 移除当前任务
function removeCurrentTask() {
  const currentTaskData = JSON.parse(localStorage.getItem("currentTask"));
  if (currentTaskData) {
    let data = GameData.get();
    data.tasks = data.tasks.filter(task => task.id !== currentTaskData.id);
    GameData.set(data);
  }
}

// 游戏失败
function gameFailed() {
  playEffectAudio("fail.mp3");
  clearInterval(countdownInterval);
  let data = GameData.get();
  if (data.score >= 80) {
    data.score = Math.max(0, data.score + 15 - 80);
  } else {
    data.score += 15;
    data.starRating = Math.max(0, data.starRating - 1);
  }
  if (data.energy > 0) {
    data.energy -= 1;
  }
  GameData.set(data);
  showToast("任务失败！");
  setTimeout(() => { window.location.href = "index.html"; }, 1200);
}

// ---------------------------
// 桌面时钟模块
// ---------------------------
function updateClock() {
  const clockElem = document.getElementById("clock");
  if (!clockElem) return;
  const now = new Date();
  const days = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const dayName = days[now.getDay()];
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const date = now.getDate().toString().padStart(2, "0");
  const hours24 = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours24Str = hours24.toString().padStart(2, "0");
  clockElem.innerHTML = `${dayName} ${year}.${month}.${date}<br>${period} ${hours24Str}:${minutes}:${seconds}`;
}
setInterval(updateClock, 1000);
updateClock();

// ---------------------------
// 背景音乐播放模块
// ---------------------------
function setupMusicControl() {
  const audio = document.getElementById("bgAudio");
  const playBtn = document.getElementById("playMusicBtn");
  const stopBtn = document.getElementById("stopMusicBtn");
  if (!audio || !playBtn || !stopBtn) return;
  playBtn.addEventListener("click", () => {
    audio.loop = true;
    audio.play().then(() => {
      playBtn.style.display = "none";
      stopBtn.style.display = "inline-block";
    }).catch(err => showToast("播放失败"));
  });
  stopBtn.addEventListener("click", () => {
    audio.pause();
    audio.currentTime = 0;
    stopBtn.style.display = "none";
    playBtn.style.display = "inline-block";
  });
}

// ---------------------------
// 任务管理模块
// ---------------------------
function loadTaskList() {
  let data = GameData.get();
  let taskListDiv = document.getElementById("taskList");
  taskListDiv.innerHTML = "";
  data.tasks.forEach((task, index) => {
    let div = document.createElement("div");
    div.className = "taskItem";
    div.innerHTML =
      "<span>" + task.name + "</span>" +
      "<button onclick='deleteTask(" + task.id + ")'>删除</button>";
    taskListDiv.appendChild(div);
  });
}
function addTask() {
  const taskInput = document.getElementById("taskInput");
  const taskText = taskInput.value.trim();
  if (taskText === "" || taskText.length > 50) {
    showToast("请输入1-50字以内的任务");
    return;
  }
  let data = GameData.get();
  let newId = Date.now() + Math.floor(Math.random() * 10000);
  data.tasks.push({ id: newId, name: taskText });
  GameData.set(data);
  taskInput.value = "";
  loadTaskList();
  updateDashboardTaskList();
}
function deleteTask(id) {
  let data = GameData.get();
  data.tasks = data.tasks.filter(task => task.id !== id);
  GameData.set(data);
  loadTaskList();
  updateDashboardTaskList();
}

// ---------------------------
// 抽奖系统模块
// ---------------------------
function startLotteryDraw() {
  let data = GameData.get();
  if (data.lotteryChances <= 0) {
    showToast("没有抽奖机会！");
    return;
  }
  data.lotteryChances -= 1;
  data.lotteryCount += 1;
  data.lotteryGuarantee += 1;
  let probabilityS = 0.005 + 0.0005 * Math.floor(data.lotteryCount / 10);
  let isGuaranteed = (data.lotteryGuarantee >= 20);
  let randomValue = Math.random();
  let result = "";
  if (isGuaranteed || randomValue < probabilityS) {
    result = "S级：现金奖励（+3元现金）";
    data.cash += 3;
    data.lotteryGuarantee = 0;
  } else if (randomValue < probabilityS + 0.05) {
    result = "A级：金币奖励（+200金币）";
    data.coins += 200;
  } else if (randomValue < probabilityS + 0.05 + 0.15) {
    result = "B级：抽奖机会奖励（+1次）";
    data.lotteryChances += 1;
  } else {
    result = "C级：金币奖励（+10金币） & 自动启动击杀任务小游戏";
    data.coins += 10;
    setTimeout(function () {
      startGame();
    }, 2000);
  }
  GameData.set(data);
  document.getElementById("drawResult").textContent = result;
}

// ---------------------------
// 签到系统模块
// ---------------------------
function signIn() {
  let data = GameData.get();
  let now = new Date();
  let todayStr = getLocalDateStr(now);
  let currentHours = now.getHours();
  let currentMinutes = now.getMinutes();
  if (!data.signInHistory) data.signInHistory = {};

  // 判断是否已签到
  let lastSignIn = data.lastSignInDate ? new Date(data.lastSignInDate) : null;
  if (lastSignIn && lastSignIn.toDateString() === now.toDateString() && data.signInHistory[todayStr] === "signed") {
    document.getElementById("signInMessage").textContent = "今天已经签到过了！";
    return;
  }

  // 判断时间段
  const nowMinutes = currentHours * 60 + currentMinutes;
  const startSign = 6 * 60; // 06:00
  const endSign = 15 * 60;  // 12:00

  if (nowMinutes >= startSign && nowMinutes < endSign) {
    // 06:00:00 - 11:59:59 签到成功
    data.coins += 5;
    data.lotteryChances += 1;
    let yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (lastSignIn && lastSignIn.toDateString() === yesterday.toDateString() && data.signInHistory[getLocalDateStr(yesterday)] === "signed") {
      data.consecutiveSignIn += 1;
    } else {
      data.consecutiveSignIn = 1;
    }
    // 连续签到奖励
    if (data.consecutiveSignIn === 3) {
      data.coins += 30;
    } else if (data.consecutiveSignIn === 5) {
      data.coins += 50;
    } else if (data.consecutiveSignIn === 11) {
      data.coins += 110;
      data.lotteryChances += 2;
    } else if (data.consecutiveSignIn === 17) {
      data.coins += 170;
      data.lotteryChances += 3;
    } else if (data.consecutiveSignIn === 30) {
      data.coins += 310;
      data.lotteryChances += 5;
    } else if (data.consecutiveSignIn > 30) {
      data.coins += 410;
      data.lotteryChances += 7;
    }
    data.lastSignInDate = now;
    data.signInHistory[todayStr] = "signed";
    GameData.set(data);
    document.getElementById("signInMessage").textContent = "签到成功！奖励已发放。";
    renderCalendar();
    return;
  } else if (nowMinutes < startSign || nowMinutes >= endSign) {
    // 00:00:00-05:59:59 或 12:00:00-23:59:59
    document.getElementById("signInMessage").textContent = "请在规定时间内完成签到";
    renderCalendar();
    return;
  }
  // 超过11:59:59，判定为签到失败（理论上不会走到这里，但保留逻辑）
  if (nowMinutes >= endSign) {
    data.consecutiveSignIn = 0;
    data.lastSignInDate = now;
    data.signInHistory[todayStr] = "failed";
    GameData.set(data);
    document.getElementById("signInMessage").textContent = "签到失败，连续签到已重置。";
    renderCalendar();
    return;
  }
}

// ---------------------------
// 日历签到渲染
// ---------------------------
let calendarMonthOffset = 0; // 0为本月，-1为上月，1为下月

function renderCalendar() {
  let data = GameData.get();
  if (!data.signInHistory) data.signInHistory = {};
  const calendarDiv = document.getElementById("calendar");
  if (!calendarDiv) return;

  // 计算当前显示的年月
  let now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + calendarMonthOffset;
  while (month < 0) { year--; month += 12; }
  while (month > 11) { year++; month -= 12; }
  let firstDay = new Date(year, month, 1);
  let lastDay = new Date(year, month + 1, 0);
  let todayStr = getLocalDateStr(new Date());

  // 日历头部
  let html = `<div id="calendar-nav">
    <button onclick="calendarMonthOffset--;renderCalendar();">&lt;</button>
    <span>${year}年${month + 1}月</span>
    <button onclick="calendarMonthOffset++;renderCalendar();">&gt;</button>
  </div>`;
  html += `<table class="calendar-table"><thead><tr>
    <th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th>
  </tr></thead><tbody><tr>`;

  // 空白填充
  for (let i = 0; i < firstDay.getDay(); i++) html += `<td class="empty"></td>`;

  // 填充日期
  for (let d = 1; d <= lastDay.getDate(); d++) {
    let dateObj = new Date(year, month, d);
    let dateStr = getLocalDateStr(dateObj);
    let cls = "";
    if (data.signInHistory[dateStr] === "signed") cls = "signed";
    else if (data.signInHistory[dateStr] === "failed") cls = "failed";
    if (dateStr === todayStr) cls += " today";
    html += `<td class="${cls.trim()}">${d}</td>`;
    if ((dateObj.getDay() + 1) % 7 === 0 && d !== lastDay.getDate()) html += "</tr><tr>";
  }
  // 末尾空白
  let lastDateObj = new Date(year, month, lastDay.getDate());
  for (let i = lastDateObj.getDay() + 1; i < 7; i++) html += `<td class="empty"></td>`;
  html += "</tr></tbody></table>";

  calendarDiv.innerHTML = html;
}

// ---------------------------
// 金币商城模块
// ---------------------------
function exchangeLottery() {
  let data = GameData.get();
  if (data.coins >= 3000) {
    data.coins -= 3000;
    data.lotteryChances += 1;
    GameData.set(data);
    document.getElementById("shopMessage").textContent = "兑换成功：抽奖机会 +1";
  } else {
    document.getElementById("shopMessage").textContent = "金币不足";
  }
}
function exchangeCash() {
  let data = GameData.get();
  if (data.coins >= 5000) {
    data.coins -= 5000;
    data.cash += 0.5;
    GameData.set(data);
    document.getElementById("shopMessage").textContent = "兑换成功：现金 +0.5元";
  } else {
    document.getElementById("shopMessage").textContent = "金币不足";
  }
}
function exchangeEnergy() {
  let data = GameData.get();
  if (data.coins >= 2000) {
    data.coins -= 2000;
    data.energy = Math.min(5, data.energy + 1);
    GameData.set(data);
    document.getElementById("shopMessage").textContent = "兑换成功：体力值 +1";
  } else {
    document.getElementById("shopMessage").textContent = "金币不足";
  }
}

// ---------------------------
// 页面初始化与事件绑定
// ---------------------------
function initEventListeners() {
  if (document.getElementById("resetDataBtn")) {
    document.getElementById("resetDataBtn").addEventListener("click", resetGameData);
  }
  if (document.getElementById("startGameBtn")) {
    document.getElementById("startGameBtn").addEventListener("click", startGame);
  }
  if (document.getElementById("coins")) {
    updateDashboard();
    updateDashboardTaskList();
  }
  if (document.getElementById("taskList")) {
    loadTaskList();
    document.getElementById("addTaskBtn").addEventListener("click", addTask);
  }
  if (document.getElementById("timerDisplay")) {
    let currentTaskData = JSON.parse(localStorage.getItem("currentTask"));
    if (currentTaskData && document.getElementById("taskNameDisplay")) {
      document.getElementById("taskNameDisplay").textContent = currentTaskData.name;
    }
    startCountdown();
    if (document.getElementById("completeTaskBtn")) {
      document.getElementById("completeTaskBtn").addEventListener("click", completeTask);
    }
    if (document.getElementById("giveUpBtn")) {
      document.getElementById("giveUpBtn").addEventListener("click", gameFailed);
    }
  }
  if (document.getElementById("startDrawBtn")) {
    document.getElementById("startDrawBtn").addEventListener("click", startLotteryDraw);
  }
  if (document.getElementById("signInBtn")) {
    document.getElementById("signInBtn").addEventListener("click", signIn);
  }
  if (document.getElementById("exchangeLotteryBtn")) {
    document.getElementById("exchangeLotteryBtn").addEventListener("click", exchangeLottery);
  }
  if (document.getElementById("exchangeCashBtn")) {
    document.getElementById("exchangeCashBtn").addEventListener("click", exchangeCash);
  }
  if (document.getElementById("exchangeEnergyBtn")) {
    document.getElementById("exchangeEnergyBtn").addEventListener("click", exchangeEnergy);
  }
  setupMusicControl();
  // 日历渲染
  if (document.getElementById("calendar")) {
    renderCalendar();
  }
}

// index.html专用：背景音乐播放按钮逻辑
function setupIndexBgmControl() {
  const bgmBtn = document.getElementById('bgmToggleBtn');
  const bgmAudio = document.getElementById('indexBgAudio');
  if (!bgmBtn || !bgmAudio) return;
  let isPlaying = false;
  bgmBtn.addEventListener('click', function() {
    if (!isPlaying) {
      bgmAudio.currentTime = 0;
      bgmAudio.play();
      bgmBtn.textContent = '关闭背景音乐';
      isPlaying = true;
    } else {
      bgmAudio.pause();
      bgmAudio.currentTime = 0;
      bgmBtn.textContent = '播放背景音乐';
      isPlaying = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  GameData.initialize();
  checkAndResetRankSystem();
  recoverEnergyOnLoad();
  initEventListeners();
  setupIndexBgmControl(); // 新增：主页背景音乐按钮
  // 检查是否有升段信息
  const rankupInfo = localStorage.getItem('rankupInfo');
  if (rankupInfo) {
    try {
      const info = JSON.parse(rankupInfo);
      if (info.rank) {
        showRankupModal(info.rank);
      }
    } catch(e) {}
    localStorage.removeItem('rankupInfo');
  }
});

// 段位可视化渲染
function renderRankPanel() {
  const data = GameData.get();
  const star = data.starRating || 0;
  // 段位分级
  const rankList = [
    { min: 0, max: 3, name: "铜Ⅲ", icon: "🥉", need: 4 },
    { min: 4, max: 6, name: "青铜Ⅱ", icon: "🥉", need: 3 },
    { min: 7, max: 9, name: "青铜Ⅰ", icon: "🥉", need: 3 },
    { min: 10, max: 12, name: "白银Ⅲ", icon: "🥈", need: 3 },
    { min: 13, max: 15, name: "白银Ⅱ", icon: "🥈", need: 3 },
    { min: 16, max: 18, name: "白银Ⅰ", icon: "🥈", need: 3 },
    { min: 19, max: 22, name: "黄金Ⅳ", icon: "🥇", need: 4 },
    { min: 23, max: 26, name: "黄金Ⅲ", icon: "🥇", need: 4 },
    { min: 27, max: 30, name: "黄金Ⅱ", icon: "🥇", need: 4 },
    { min: 31, max: 34, name: "黄金Ⅰ", icon: "🥇", need: 4 },
    { min: 35, max: 38, name: "铂金Ⅳ", icon: "🎖️", need: 4 },
    { min: 39, max: 42, name: "铂金Ⅲ", icon: "🎖️", need: 4 },
    { min: 43, max: 46, name: "铂金Ⅱ", icon: "🎖️", need: 4 },
    { min: 47, max: 50, name: "铂金Ⅰ", icon: "🎖️", need: 4 },
    { min: 51, max: 55, name: "钻石Ⅴ", icon: "🧱", need: 5 },
    { min: 56, max: 60, name: "钻石Ⅳ", icon: "🧱", need: 5 },
    { min: 61, max: 65, name: "钻石Ⅲ", icon: "🧱", need: 5 },
    { min: 66, max: 70, name: "钻石Ⅱ", icon: "🧱", need: 5 },
    { min: 71, max: 75, name: "钻石Ⅰ", icon: "🧱", need: 5 },
    { min: 76, max: 80, name: "星耀Ⅴ", icon: "🏅", need: 5 },
    { min: 81, max: 85, name: "星耀Ⅳ", icon: "🏅", need: 5 },
    { min: 86, max: 90, name: "星耀Ⅲ", icon: "🏅", need: 5 },
    { min: 91, max: 95, name: "星耀Ⅱ", icon: "🏅", need: 5 },
    { min: 96, max: 100, name: "星耀Ⅰ", icon: "🏅", need: 5 },
    { min: 101, max: 109, name: "最强王者", icon: "🏆", need: 9 },
    { min: 110, max: 124, name: "非凡王者", icon: "😠", need: 15 },
    { min: 125, max: 134, name: "无双王者", icon: "😡", need: 10 },
    { min: 135, max: 149, name: "绝世王者", icon: "👺", need: 15 },
    { min: 150, max: 174, name: "至圣王者", icon: "💀", need: 25 },
    { min: 175, max: 199, name: "荣耀王者", icon: "🫤", need: 25 },
    { min: 200, max: 9999, name: "传奇王者", icon: "👹", need: 100 }
  ];
  let rank = rankList.find(r => star >= r.min && star <= r.max) || rankList[rankList.length-1];
  let currentStars = star - rank.min;
  let needStars = rank.need;
  // 段位名与图标
  const rankVisual = document.getElementById("rankVisual");
  if (rankVisual) {
    let starsHtml = '';
    for (let i = 0; i < needStars; i++) {
      if (i < currentStars) {
        starsHtml += '<span class="star-visual">★</span>';
      } else {
        starsHtml += '<span class="star-visual" style="opacity:.25;filter:grayscale(1);">★</span>';
      }
    }
    rankVisual.innerHTML = `<span>${rank.icon}</span><span>${rank.name}</span>${starsHtml}`;
  }
  // 星星进度条
  const bar = document.getElementById("starProgressBar");
  if (bar) {
    let percent = Math.min(100, (currentStars / needStars) * 100);
    bar.style.width = percent + "%";
    bar.textContent = `${currentStars}/${needStars} 星`;
  }
  // 升段提示
  const info = document.getElementById("starInfo");
  if (info) {
    if (currentStars < needStars) {
      info.textContent = `再获得 ${needStars - currentStars} 星可升至下一个段位！`;
    } else {
      info.textContent = `恭喜！即将升段！`;
    }
  }
}

// 弹窗+音效函数
function showRankupModal(rankName) {
  const modal = document.getElementById('rankupModal');
  const title = document.getElementById('rankupTitle');
  const desc = document.getElementById('rankupDesc');
  if (modal && title && desc) {
    title.textContent = `恭喜进入${rankName}段位！`;
    desc.textContent = `新的挑战已经开启，继续加油！`;
    modal.style.display = 'flex';
    // 播放音效，增强兼容性
    const audio = document.getElementById('rankupAudio');
    if (audio) {
      audio.currentTime = 0;
      audio.muted = false;
      // 尝试多次播放，提升成功率
      const tryPlay = () => {
        const p = audio.play();
        if (p && typeof p.then === 'function') {
          p.catch(() => {
            setTimeout(() => audio.play(), 200);
          });
        }
      };
      tryPlay();
      // 用户点击弹窗时再尝试播放一次
      modal.addEventListener('click', tryPlay, { once: true });
    }
  }
}

// 工具函数：获取本地日期字符串（yyyy-mm-dd）
function getLocalDateStr(date) {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 新增：倒计时页面专用时钟（美观简约，位于任务名和倒计时之间）
function updateCountdownClock() {
  const clockElem = document.getElementById("countdownClock");
  if (!clockElem) return;
  const now = new Date();
  const days = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const dayName = days[now.getDay()];
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const date = now.getDate().toString().padStart(2, "0");
  const hours24 = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = (hours24 % 12 === 0 ? 12 : hours24 % 12).toString().padStart(2, "0");
  // 需求为24小时制但加PM/AM
  const hoursShow = hours24.toString().padStart(2, "0");
  clockElem.textContent = `${dayName} ${year}.${month}.${date} ${period}${hoursShow}:${minutes}:${seconds}`;
}
// 页面加载时只在倒计时页面启用
if (window.location.pathname.endsWith('countdown.html')) {
  setInterval(updateCountdownClock, 1000);
  updateCountdownClock();
}

// 首页专用：左上角吸附时钟
function updateMainPageClock() {
  const clockElem = document.getElementById("mainPageClock");
  if (!clockElem) return;
  const now = new Date();
  const weekArr = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const h = now.getHours().toString().padStart(2, "0");
  const m = now.getMinutes().toString().padStart(2, "0");
  const s = now.getSeconds().toString().padStart(2, "0");
  const mon = (now.getMonth() + 1).toString().padStart(2, "0");
  const d = now.getDate().toString().padStart(2, "0");
  const week = weekArr[now.getDay()];
  clockElem.innerHTML = `${h}:${m}:${s}<br>${mon}/${d} ${week}`;
}
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '/index.html') {
  setInterval(updateMainPageClock, 1000);
  updateMainPageClock();
}

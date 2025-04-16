/* script.js */

/* ---------------------------
   数据初始化与存取函数
   --------------------------- */
function initializeGameData() {
  // 如果 localStorage 中没有 gameData 则初始化默认数据
  if (!localStorage.getItem("gameData")) {
    const defaultData = {
      tasks: ["任务1", "任务2", "任务3", "任务4"], // 默认任务示例
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
      // 新增：记录段位系统上次重置的时间
      lastRankReset: new Date().toISOString()
    };
    localStorage.setItem("gameData", JSON.stringify(defaultData));
  }
}

function getGameData() {
  return JSON.parse(localStorage.getItem("gameData"));
}

function setGameData(data) {
  localStorage.setItem("gameData", JSON.stringify(data));
}

/* ---------------------------
   更新主界面数据看板（index.html）
   --------------------------- */
function updateDashboard() {
  const data = getGameData();
  if (document.getElementById("taskCount"))
    document.getElementById("taskCount").textContent = data.tasks.length;
  if (document.getElementById("coins"))
    document.getElementById("coins").textContent = data.coins;
  if (document.getElementById("lotteryChances"))
    document.getElementById("lotteryChances").textContent = data.lotteryChances;
  if (document.getElementById("score"))
    document.getElementById("score").textContent = Math.min(data.score, 240); // 不超过240
  if (document.getElementById("starRating"))
    // 修改后的段位展示，只显示称号和数字（例如“铜Ⅲ (5星)”）
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

  // 更新积分进度条：
  if (document.getElementById("scoreProgressBar")) {
    let percent = Math.min(100, (data.score / 240) * 100);
    document.getElementById("scoreProgressBar").style.width = percent + "%";
    document.getElementById("scoreProgressBar").textContent = Math.min(data.score, 240) + "/240";
  }
}


/* ---------------------------
   更新主页任务栏展板（index.html专用）
   --------------------------- */
function updateDashboardTaskList() {
  let data = getGameData();
  let panel = document.getElementById("dashboardTaskList");
  if (panel) {
    panel.innerHTML = "";
    data.tasks.forEach((task, idx) => {
      let taskDiv = document.createElement("div");
      taskDiv.className = "taskItem";
      taskDiv.textContent = task;
      panel.appendChild(taskDiv);
    });
  }
}

/* ---------------------------
   段位系统

   辅助函数：修改后只显示称号与数字，不显示“⭐”
   --------------------------- */
function getStarDisplay(stars) {
  let level = "";
  //三星升段
  if (stars <= 3) level = "3⭐铜Ⅲ🥉";
  else if (stars <= 6) level = "6⭐青铜Ⅱ🥉";
  else if (stars <= 9) level = "9⭐青铜Ⅰ🥉";
  else if (stars <= 12) level = "12⭐白银Ⅲ🥈";
  else if (stars <= 15) level = "15⭐白银Ⅱ🥈";
  else if (stars <= 18) level = "18⭐白银Ⅰ🥈";
  //四星升段
  else if (stars <= 22) level = "22⭐黄金Ⅳ🥇";
  else if (stars <= 26) level = "26⭐黄金Ⅲ🥇";
  else if (stars <= 30) level = "30⭐黄金Ⅱ🥇";
  else if (stars <= 34) level = "34⭐黄金Ⅰ🥇";
  else if (stars <= 38) level = "38⭐铂金Ⅳ🎖️";
  else if (stars <= 42) level = "42⭐铂金Ⅲ🎖️";
  else if (stars <= 46) level = "46⭐铂金Ⅱ🎖️";
  else if (stars <= 50) level = "50⭐铂金Ⅰ🎖️";
  //五星升段
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

  // 修改：直接显示累计星数，不使用“⭐”符号
  return stars + "/" + level;

}

/* ---------------------------
    // 超过 90 天，自动重置段位系统（赛季更新）
   --------------------------- */

function checkAndResetRankSystem() {
  let data = getGameData();
  let now = new Date().getTime();
  let lastReset = data.lastRankReset ? new Date(data.lastRankReset).getTime() : now;
  // 90天的毫秒数90 * 24 * 3600 * 1000
  const threeMonths = 90 * 24 * 3600 * 1000;
  if (now - lastReset >= threeMonths) {
    // 超过 90 天，自动重置段位系统
    data.starRating = 0;
    data.lastRankReset = new Date().toISOString();
    setGameData(data);
    console.log("段位系统已自动重置！");
  }
}


/* ---------------------------
// 在控制台输入下面这段代码进行测试（赛季更新）

// 刷新页面后，系统会判断当前时间与修改后的 lastRankReset 相差已超过 90 天，从而执行重置。
let data = JSON.parse(localStorage.getItem("gameData"));
// 设置 lastRankReset 为当前时间之前 100 天
data.lastRankReset = new Date(Date.now() - 100 * 24 * 3600 * 1000).toISOString();
localStorage.setItem("gameData", JSON.stringify(data));
// 然后刷新页面或调用 checkAndResetRankSystem()

   --------------------------- */




/* ---------------------------
   重置数据（index.html“重置数据”按钮）
   --------------------------- */
function resetGameData() {
  if (confirm("确定重置所有数据吗？此操作不可恢复！")) {
    localStorage.removeItem("gameData");
    initializeGameData();
    updateDashboard();
    updateDashboardTaskList();
    alert("数据已重置");
  }
}

/* ---------------------------
   游戏流程：随机抽取任务、进入倒计时界面（index.html & countdown.html）
   --------------------------- */
function startGame() {
  const data = getGameData();
  if (data.energy <= 0) {
    alert("体力值为0，无法开始游戏！");
    return;
  }
  if (data.tasks.length === 0) {
    alert("当前无任务，请先添加任务！");
    return;
  }
  // （修改后）：游戏开始不扣除体力值，只有失败时才扣除
  // 随机抽取一条任务
  const randomIndex = Math.floor(Math.random() * data.tasks.length);
  const selectedTask = data.tasks[randomIndex];
  // 将选中任务和相关信息存入 localStorage 供倒计时页面使用
  localStorage.setItem("currentTask", JSON.stringify({task: selectedTask, index: randomIndex, startTime: Date.now()}));
  // 展示任务名称5秒后跳转到倒计时页面
  alert("抽取到任务：" + selectedTask + "（展示5秒）");
  setTimeout(function () {
    window.location.href = "countdown.html";
  }, 5000);
}

/* ---------------------------
   倒计时模块（countdown.html）：启动30分钟倒计时，提供“任务完成”和“放弃”两按钮操作
   --------------------------- */
var countdownInterval;

function startCountdown() {
  // 初始倒计时时间：30分钟
  let remainingTime = 30 * 60;
  updateTimerDisplay(remainingTime);
  countdownInterval = setInterval(function () {
    remainingTime--;
    updateTimerDisplay(remainingTime);
    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      gameFailed(); // 自动判断游戏失败
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


// “任务完成”按钮点击事件：根据剩余时间判定不同奖励，并移除当前任务
function completeTask() {
  clearInterval(countdownInterval);
  // 获取倒计时剩余时间（单位：秒）
  let parts = document.getElementById("timerDisplay").textContent.split(":");
  let totalSeconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  let data = getGameData();

  // 根据剩余时间判定奖励
  if (totalSeconds >= 15 * 60 && totalSeconds <= 30 * 60) {
    // 第一种情况：15:00 ~ 30:00（含 30:00）
    data.coins += 30;
    data.lotteryChances += 2;
    data.score += 30;
    data.starRating += 1;
    // 保存奖励数据
    setGameData(data);
  } else if (totalSeconds >= 5 * 60 && totalSeconds < 15 * 60) {
    // 第二种情况：5:00 ~ 14:59
    data.coins += 20;
    data.lotteryChances += 1;
    data.score += 30;
    data.starRating += 1;
    // 保存奖励数据
    setGameData(data);
  } else if (totalSeconds >= 0 && totalSeconds < 5 * 60) {
    // 第三种情况：0:00 ~ 4:59
    data.coins += 10;
    data.score += 30;
    data.starRating += 1;
    // 保存奖励数据
    setGameData(data);
  }

  // 如果奖励后积分达到或超过 240，则额外处理：扣除70积分，段位+1
  if (data.score >= 240) {
    data.score = data.score - 70;
    data.starRating += 1;
    // 保存奖励数据
    setGameData(data);
  }
  // 为保证积分上限始终为240，若积分意外超过，则手动设为240（也可根据业务需求调整）
  data.score = Math.min(data.score, 240);
  // 保存奖励数据
  setGameData(data);


  alert("任务完成，游戏胜利！");

  // 调用函数将当前任务从总任务栏移除
  removeCurrentTask();

  // 更新主页数据看板与任务栏展板数据（任务数量减少）
  updateDashboard();
  updateDashboardTaskList();

  window.location.href = "index.html";

}


// 将当前抽取的任务从任务列表中移除（任务完成后自动调用）
function removeCurrentTask() {
  const currentTaskData = JSON.parse(localStorage.getItem("currentTask"));
  if (currentTaskData) {
    let data = getGameData();
    // 根据存储的索引移除对应的任务
    data.tasks.splice(currentTaskData.index, 1);
    setGameData(data);
  }
}

// 游戏失败：点击“放弃”按钮或倒计时结束时调用
// 修改：游戏失败时扣除1颗体力值
function gameFailed() {
  clearInterval(countdownInterval);
  let data = getGameData();
  // 如果积分≥80时，用80积分抵扣星级下降
  if (data.score >= 80) {
    data.score = Math.max(0, data.score + 15 - 80);
    // 段位不做任何变化
  } else {
    // 积分不足80时，按照原来的失败奖励，并扣除1颗星
    data.score += 15;
    data.starRating = Math.max(0, data.starRating - 1);
  }
  // 扣除1颗体力值（失败时扣体力）
  if (data.energy > 0) {
    data.energy -= 1;
  }
  setGameData(data);
  alert("任务失败！");
  window.location.href = "index.html";
}


/* ---------------------------
   胜利动画：撒花效果，持续1秒
   --------------------------- */
function victoryAnimation() {
  for (let i = 0; i < 30; i++) {
    let confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.backgroundColor = "hsl(" + Math.random() * 360 + ", 100%, 50%)";
    document.body.appendChild(confetti);
    setTimeout(function () {
      document.body.removeChild(confetti);
    }, 1000);
  }
}

/* ---------------------------
   任务管理模块（tasks.html）
   --------------------------- */

// 加载任务列表，显示所有任务
function loadTaskList() {
  let data = getGameData();
  let taskListDiv = document.getElementById("taskList");
  taskListDiv.innerHTML = "";
  data.tasks.forEach((task, index) => {
    let div = document.createElement("div");
    div.className = "taskItem";
    div.innerHTML =
      "<span>" + task + "</span>" +
      "<button onclick='deleteTask(" + index + ")'>删除</button>";
    taskListDiv.appendChild(div);
  });
}

// 新增任务
function addTask() {
  const taskInput = document.getElementById("taskInput");
  const taskText = taskInput.value.trim();
  if (taskText === "" || taskText.length > 50) {
    alert("请输入1-50字以内的任务");
    return;
  }
  let data = getGameData();
  data.tasks.push(taskText);
  setGameData(data);
  taskInput.value = "";
  loadTaskList();
  updateDashboardTaskList();
}

// 删除指定任务
function deleteTask(index) {
  let data = getGameData();
  data.tasks.splice(index, 1);
  setGameData(data);
  loadTaskList();
  updateDashboardTaskList();
}

/* ---------------------------
   抽奖系统模块（draw.html）
   --------------------------- */
function startLotteryDraw() {
  let data = getGameData();
  if (data.lotteryChances <= 0) {
    alert("没有抽奖机会！");
    return;
  }
  data.lotteryChances -= 1;
  data.lotteryCount += 1;
  data.lotteryGuarantee += 1;
  // S级基础概率 0.5%，并根据抽奖次数提高概率
  let probabilityS = 0.005 + 0.0005 * Math.floor(data.lotteryCount / 10);
  // 保底：每累计20次必得 S 级奖励
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
    // 修改：C级奖励不直接返回主页，而是展示结果后立即开始任务抽取
    setTimeout(function () {
      startGame();
    }, 2000);
  }
  setGameData(data);
  document.getElementById("drawResult").textContent = result;
}

/* ---------------------------
   签到系统模块（signIn.html）
   --------------------------- */
function signIn() {
  let data = getGameData();
  let now = new Date();
  let currentHours = now.getHours();
  // 签到时间限定在 06:00 - 10:00 之间
  if (currentHours >= 6 && currentHours < 10) {
    let lastSignIn = data.lastSignInDate ? new Date(data.lastSignInDate) : null;
    if (lastSignIn && lastSignIn.toDateString() === now.toDateString()) {
      document.getElementById("signInMessage").textContent = "今天已经签到过了！";
      return;
    }
    // 发放签到奖励
    data.coins += 5;
    data.lotteryChances += 1;
    // 连续签到判定
    let yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (lastSignIn && lastSignIn.toDateString() === yesterday.toDateString()) {
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
    setGameData(data);
    document.getElementById("signInMessage").textContent = "签到成功！奖励已发放。";
  } else {
    document.getElementById("signInMessage").textContent = "请在规定时间内（06:00 - 10:00）完成签到";
  }
}

/* ---------------------------
   金币商城模块（shop.html）
   --------------------------- */
function exchangeLottery() {
  let data = getGameData();
  if (data.coins >= 3000) {
    data.coins -= 3000;
    data.lotteryChances += 1;
    setGameData(data);
    document.getElementById("shopMessage").textContent = "兑换成功：抽奖机会 +1";
  } else {
    document.getElementById("shopMessage").textContent = "金币不足";
  }
}

function exchangeCash() {
  let data = getGameData();
  if (data.coins >= 5000) {
    data.coins -= 5000;
    data.cash += 0.5;
    setGameData(data);
    document.getElementById("shopMessage").textContent = "兑换成功：现金 +0.5元";
  } else {
    document.getElementById("shopMessage").textContent = "金币不足";
  }
}

function exchangeEnergy() {
  let data = getGameData();
  if (data.coins >= 2000) {
    data.coins -= 2000;
    data.energy = Math.min(5, data.energy + 1);
    setGameData(data);
    document.getElementById("shopMessage").textContent = "兑换成功：体力值 +1";
  } else {
    document.getElementById("shopMessage").textContent = "金币不足";
  }
}

/* ---------------------------
   体力值恢复：当体力值小于5时，每隔1小时恢复1颗（上限5颗）
   --------------------------- */
function startEnergyRecovery() {
  setInterval(function () {
    let data = getGameData();
    if (data.energy < 5) {
      data.energy += 1;
      setGameData(data);
      updateDashboard();
      updateDashboardTaskList();
    }
  }, 3600000);
}

/* ---------------------------
   页面初始化：根据页面内容绑定相应事件（DOMContentLoaded）
   --------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  initializeGameData();
  checkAndResetRankSystem();  // 检查并重置段位系统（每3个月自动归零）
  startEnergyRecovery();

  // index.html 页面
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

  // tasks.html 页面
  if (document.getElementById("taskList")) {
    loadTaskList();
    document.getElementById("addTaskBtn").addEventListener("click", addTask);
  }

  // countdown.html 页面：显示任务名称并启动倒计时
  if (document.getElementById("timerDisplay")) {
    let currentTaskData = JSON.parse(localStorage.getItem("currentTask"));
    if (currentTaskData && document.getElementById("taskNameDisplay")) {
      document.getElementById("taskNameDisplay").textContent = currentTaskData.task;
    }
    startCountdown();
    if (document.getElementById("completeTaskBtn")) {
      document.getElementById("completeTaskBtn").addEventListener("click", completeTask);
    }
    if (document.getElementById("giveUpBtn")) {
      document.getElementById("giveUpBtn").addEventListener("click", gameFailed);
    }
  }

  // draw.html 页面
  if (document.getElementById("startDrawBtn")) {
    document.getElementById("startDrawBtn").addEventListener("click", startLotteryDraw);
  }

  // signIn.html 页面
  if (document.getElementById("signInBtn")) {
    document.getElementById("signInBtn").addEventListener("click", signIn);
  }

  // shop.html 页面
  if (document.getElementById("exchangeLotteryBtn")) {
    document.getElementById("exchangeLotteryBtn").addEventListener("click", exchangeLottery);
  }
  if (document.getElementById("exchangeCashBtn")) {
    document.getElementById("exchangeCashBtn").addEventListener("click", exchangeCash);
  }
  if (document.getElementById("exchangeEnergyBtn")) {
    document.getElementById("exchangeEnergyBtn").addEventListener("click", exchangeEnergy);
  }
});

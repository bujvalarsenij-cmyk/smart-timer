const vscode = require('vscode');

// Переменные для таймера
let timerInterval;
let totalSeconds = 0;
let isPaused = false;
let statusBarItem;
let bookmarks = [];

function activate(context) {
  console.log('✅ Умный таймер активирован!');

  // Создаем элемент в строке состояния
  statusBarItem =
      vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  updateDisplay();
  statusBarItem.show();

  // Запускаем таймер
  startTimer();

  // Команда 1: Показать текущее время
  let showTimeCommand =
      vscode.commands.registerCommand('smart-timer.showTime', function() {
        vscode.window.showInformationMessage(
            `⏱️ Текущее время: ${formatTime(totalSeconds)}`);
      });

  // Команда 2: Пауза/Продолжить
  let pauseCommand =
      vscode.commands.registerCommand('smart-timer.pause', function() {
        if (isPaused) {
          // Продолжаем
          isPaused = false;
          startTimer();
          vscode.window.showInformationMessage('▶️ Таймер продолжен');
        } else {
          // Ставим на паузу
          isPaused = true;
          stopTimer();
          vscode.window.showInformationMessage('⏸️ Таймер на паузе');
        }
        updateDisplay();
      });

  // Команда 3: Сбросить таймер
  let resetCommand =
      vscode.commands.registerCommand('smart-timer.reset', function() {
        totalSeconds = 0;
        bookmarks = [];
        isPaused = false;
        startTimer();
        vscode.window.showInformationMessage('🔄 Таймер сброшен');
        updateDisplay();
      });

  // Команда 4: Показать статистику
  let statsCommand =
      vscode.commands.registerCommand('smart-timer.showStats', function() {
        const statsMessage = `📊 Статистика:
⏱️ Общее время: ${formatTime(totalSeconds)}
📌 Меток: ${bookmarks.length}
${isPaused ? '⏸️ Сейчас на паузе' : '▶️ Сейчас работает'}`;

        vscode.window.showInformationMessage(statsMessage);
      });

  // Команда 5: Добавить временную метку
  let bookmarkCommand =
      vscode.commands.registerCommand('smart-timer.addBookmark', function() {
        const timestamp = formatTime(totalSeconds);
        bookmarks.push({
          time: timestamp,
          text: `Метка ${bookmarks.length + 1}`,
          totalSeconds: totalSeconds
        });

        vscode.window.showInformationMessage(
            `📌 Добавлена метка: ${timestamp}`);
      });

  // Команда 6: Показать все временные метки
  let showBookmarksCommand =
      vscode.commands.registerCommand('smart-timer.showBookmarks', function() {
        if (bookmarks.length === 0) {
          vscode.window.showInformationMessage(
              '📭 Нет сохраненных временных меток');
          return;
        }

        // Создаем сообщение со всеми метками
        let bookmarksMessage = '📋 Временные метки:\n\n';
        bookmarks.forEach((bookmark, index) => {
          bookmarksMessage +=
              `${index + 1}. ${bookmark.time} - ${bookmark.text}\n`;
        });

        bookmarksMessage += `\nВсего меток: ${bookmarks.length}`;

        // Показываем в информационном сообщении
        vscode.window.showInformationMessage(bookmarksMessage);
      });

  // Показываем сообщение об активации
  vscode.window.showInformationMessage(
      'Умный таймер запущен! Команды: Ctrl+Shift+P → Smart Timer');

  // Добавляем всё в контекст
  context.subscriptions.push(statusBarItem);
  context.subscriptions.push(showTimeCommand);
  context.subscriptions.push(pauseCommand);
  context.subscriptions.push(resetCommand);
  context.subscriptions.push(statsCommand);
  context.subscriptions.push(bookmarkCommand);
  context.subscriptions.push(showBookmarksCommand);
}

function startTimer() {
  stopTimer();  // Останавливаем предыдущий таймер
  if (!isPaused) {
    timerInterval = setInterval(() => {
      totalSeconds++;
      updateDisplay();
    }, 1000);
  }
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
}

function updateDisplay() {
  let displayText = `⏱️ ${formatTime(totalSeconds)}`;

  if (isPaused) {
    displayText = `⏸️ ${formatTime(totalSeconds)}`;
    statusBarItem.color =
        new vscode.ThemeColor('errorForeground');  // Красный цвет при паузе
  } else {
    statusBarItem.color = undefined;  // Обычный цвет
  }

  statusBarItem.text = displayText;
  statusBarItem.tooltip = `Умный таймер\nВремя: ${
      formatTime(totalSeconds)}\nМеток: ${bookmarks.length}\n${
      isPaused ?
          '⏸️ На паузе' :
          '▶️ Работает'}\n\nКоманды:\n• Пауза: Ctrl+Alt+P\n• Добавить метку\n• Показать метки\n• Статистика`;
}

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}ч ${minutes.toString().padStart(2, '0')}м ${
        seconds.toString().padStart(2, '0')}с`;
  } else if (minutes > 0) {
    return `${minutes}м ${seconds.toString().padStart(2, '0')}с`;
  } else {
    return `${seconds}с`;
  }
}

function deactivate() {
  stopTimer();
  console.log('Таймер остановлен');
}

module.exports = {
  activate,
  deactivate
};
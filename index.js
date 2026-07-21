const mineflayer = require('mineflayer');
const express = require('express');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./AFK.json', 'utf8'));

function createBot() {
  const bot = mineflayer.createBot({
    host: config.server.host,
    port: config.server.port,
    username: config.bot.baseUsername,
    version: config.server.version,
    auth: config.server.auth
  });

  bot.on('spawn', () => {
    console.log('Bot đã vào server Minecraft thành công!');

    if (config.features.antiAfk && config.features.antiAfk.enabled) {
      setInterval(() => {
        if (config.features.antiAfk.actions.jump) {
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 500);
        }
        if (config.features.antiAfk.actions.swingArm) {
          bot.swingArm('mainhand');
        }
      }, config.features.antiAfk.minInterval || 10000);
    }

    if (config.features.autoChat && config.features.autoChat.enabled) {
      const messages = config.features.autoChat.messages;
      let msgIndex = 0;
      setInterval(() => {
        if (messages && messages.length > 0) {
          bot.chat(messages[msgIndex]);
          msgIndex = (msgIndex + 1) % messages.length;
        }
      }, config.features.autoChat.interval || 60000);
    }
  });

  bot.on('end', () => {
    console.log('Bot bị ngắt kết nối, đang thử lại...');
    if (config.features.autoReconnect && config.features.autoReconnect.enabled) {
      setTimeout(createBot, config.features.autoReconnect.delay || 5000);
    }
  });

  bot.on('error', err => console.log('Lỗi:', err));
}

createBot();

const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot AFK đang chạy!'));
app.listen(port, () => console.log(`Server web port ${port}`));

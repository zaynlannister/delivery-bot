const TelegramApi = require("node-telegram-bot-api");
require("dotenv").config();

const bot = new TelegramApi(process.env.BOT_TOKEN, { polling: true });

const startKeyboard = {
  reply_markup: JSON.stringify({
    keyboard: [
      [{ text: "Меню" }],
      [{ text: "Корзина" }],
      [{ text: "Информация" }],
      [{ text: "Помощь" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  }),
};

const menu = {
  "Классический Плов": 35000,
  "Паста Болоньезе": 32000,
  "Банановый панкейк": 31000,
  "Омлет с трюфелем": 80000,
  "Утиные ножки «Конфи»": 60000,
};

const foodOptions = {
  reply_markup: JSON.stringify({
    keyboard: Object.keys(menu).map((item) => [{ text: item }]),
    resize_keyboard: true,
    one_time_keyboard: true,
  }),
};

const userCart = {};

const getUserCartProducts = (chatId) => {
  const products = [];
  userCart[chatId].forEach((item, index) => {
    products.push(`\n${index + 1}. ${item.name} - ${item.price}`);
  });
  return products;
};

const start = () => {
  bot.setMyCommands([
    { command: "/start", description: "Запуск бота" },
    { command: "/info", description: "Информация о боте" },
    { command: "/help", description: "Помощь" },
    { command: "/cart", description: "Просмотреть корзину" },
  ]);

  bot.on("message", (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === "/start") {
      return bot.sendMessage(chatId, "Добро пожаловать!", {
        ...startKeyboard,
        disable_notification: true,
      });
    }

    if (text === "Меню") {
      return bot.sendMessage(chatId, "Вот наше меню:", {
        ...foodOptions,
        disable_notification: true,
      });
    }

    if (text === "Корзина" || text === "/cart") {
      const cartProducts = getUserCartProducts(chatId);
      const cartMessage = `Корзина:\n${cartProducts.join("")}`;
      return bot.sendMessage(chatId, cartMessage);
    }

    if (text === "/info" || text === "Информация") {
      return bot.sendMessage(chatId, "Это бот для доставки еды!", {
        disable_notification: true,
      });
    }

    if (text === "/help" || text === "Помощь") {
      return bot.sendMessage(
        chatId,
        "Доступные команды:\n\n/start - запуск бота\n/info - подробная информация о боте\n/help - помощь",
        { disable_notification: true }
      );
    }

    if (menu[text]) {
      userCart[chatId] = userCart[chatId] || [];
      userCart[chatId].push({ name: text, price: menu[text] });

      return bot.sendMessage(chatId, `Блюдо "${text}" добавлено в корзину.`);
    }

    return bot.sendMessage(
      chatId,
      "Я вас не понимаю, попробуйте воспользоваться командой /help для помощи",
      { disable_notification: true }
    );
  });

  bot.on("callback_query", (msg) => {
    console.log(msg);
  });
};

start();

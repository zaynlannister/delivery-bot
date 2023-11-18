const TelegramApi = require("node-telegram-bot-api");
require("dotenv").config();

const bot = new TelegramApi(process.env.BOT_TOKEN, { polling: true });

const startKeyboard = {
  reply_markup: JSON.stringify({
    keyboard: [
      [{ text: "🍽 Меню" }],
      [{ text: "📥 Корзина" }],
      [{ text: "ℹ️ Информация" }],
      [{ text: "🛎 Помощь" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  }),
};

const cartKeyboard = {
  reply_markup: JSON.stringify({
    keyboard: [
      [{ text: "⬅️ Назад" }],
      [{ text: "✅ Собрал корзину" }],
      [{ text: "🔄 Очистить все" }],
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
    keyboard: [
      ["⬅️ Назад"],
      ...Object.keys(menu).reduce((acc, item, index) => {
        const rowIndex = Math.floor(index / 2);
        if (!acc[rowIndex]) {
          acc[rowIndex] = [];
        }
        acc[rowIndex].push({ text: item });
        return acc;
      }, []),
      ["📥 Корзина"],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  }),
};

const userCart = {};

const getUserCartProducts = (chatId) => {
  const products = { totalPrice: 0, meals: [] };
  userCart[chatId].forEach((item, index) => {
    products.totalPrice += item.price;
    products.meals.push(`\n${index + 1}. ${item.name} - ${item.price} cум`);
  });
  return products;
};

const start = () => {
  bot.setMyCommands([
    { command: "/start", description: "Запуск бота" },
    { command: "/info", description: "Информация о боте" },
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

    if (text === "🍽 Меню") {
      return bot.sendMessage(chatId, "Вот наше меню:", {
        ...foodOptions,
        disable_notification: true,
      });
    }

    if (text === "📥 Корзина") {
      if (userCart[chatId] && userCart[chatId].length) {
        const cartProducts = getUserCartProducts(chatId);
        const cartMessage = `Корзина:\n${cartProducts.meals.join(
          ""
        )}\n\nОбщая цена: ${cartProducts.totalPrice} сум`;
        return bot.sendMessage(chatId, cartMessage, {
          ...cartKeyboard,
          disable_notification: true,
        });
      } else {
        return bot.sendMessage(chatId, "Ваша корзина пуста.", startKeyboard);
      }
    }

    if (text === "/info" || text === "ℹ️ Информация") {
      return bot.sendMessage(
        chatId,
        "Это бот для доставки еды!\n\nTelegram: @zaynlannister\nСсылки: [Github](https://github.com/zaynlannister) | [Linkedin](https://www.linkedin.com/in/bekzod-tulayev-4775221bb/)",
        {
          ...startKeyboard,
          disable_notification: true,
          parse_mode: "Markdown",
        }
      );
    }

    if (text === "⬅️ Назад") {
      return bot.sendMessage(chatId, "Продолжим?", {
        ...startKeyboard,
        disable_notification: true,
      });
    }

    if (text === "✅ Собрал корзину") {
      return bot.sendMessage(
        chatId,
        "Эта команда еще недоступна, бот находится на стадии разработки.",
        {
          ...cartKeyboard,
          disable_notification: true,
        }
      );
    }

    if (text === "🔄 Очистить все") {
      if (userCart[chatId] && userCart[chatId].length) {
        userCart[chatId] = [];
        return bot.sendMessage(chatId, "Корзина была полностью очищена!", {
          ...startKeyboard,
          disable_notification: true,
        });
      } else {
        return bot.sendMessage(chatId, "В корзине нет блюд.", startKeyboard);
      }
    }

    if (menu[text]) {
      userCart[chatId] = userCart[chatId] || [];
      userCart[chatId].push({ name: text, price: menu[text] });

      return bot.sendMessage(chatId, `Блюдо "${text}" добавлено в корзину.`, {
        ...foodOptions,
        disable_notification: true,
      });
    }

    return bot.sendMessage(chatId, "Прошу прощения, я вас не понимаю", {
      ...startKeyboard,
      disable_notification: true,
    });
  });
};

start();

"""
Пример полного бота с обработкой команды /start
Это минимальный пример для демонстрации работы
"""

import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes

# Токен бота (получите у @BotFather)
BOT_TOKEN = os.getenv('BOT_TOKEN', '7550425973:AAGQtgwfIU2UVaNRJhdHrYdfdTY0lkmWpc8')

# URL вашего Mini App (замените на ваш реальный URL после деплоя)
MINI_APP_URL = os.getenv('MINI_APP_URL', 'https://swap-easy-app-olkf.vercel.app/')


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик команды /start"""
    user = update.effective_user
    
    welcome_text = f"""
👋 Привіт, {user.first_name}!

🎉 Ласкаво просимо до **SwapEasyApp** — зручного сервісу для обміну речами!

✨ **Що можна робити:**
• ➕ Додавати свої кейси на обмін
• 🔍 Шукати цікаві речі інших користувачів
• ❤️ Ставити лайки та знаходити взаємні інтереси
• 💬 Обговорювати умови обміну в чаті
• ⭐ Отримувати рейтинг за успішні обміни

🚀 Натисніть кнопку нижче, щоб запустити додаток!
    """
    
    # Создаем красивую кнопку для запуска Mini App
    keyboard = [
        [
            InlineKeyboardButton(
                text="🚀 Запустити SwapEasyApp",
                web_app={"url": MINI_APP_URL}
            )
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        welcome_text,
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )


def main() -> None:
    """Запуск бота"""
    # Создаем приложение
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Регистрируем обработчик команды /start
    application.add_handler(CommandHandler("start", start))
    
    # Запускаем бота
    print("Бот запущен! Нажмите Ctrl+C для остановки.")
    application.run_polling()


if __name__ == '__main__':
    main()


"""
Telegram Bot - Обработчик команды /start
Создает приветственное сообщение с кнопкой для запуска Mini App
"""

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes
import os

# Токен бота из переменной окружения
API_TOKEN = os.getenv('API_TOKEN', '7550425973:AAGQtgwfIU2UVaNRJhdHrYdfdTY0lkmWpc8')

# URL вашего Mini App (замените на ваш URL после деплоя)
MINI_APP_URL = os.getenv('MINI_APP_URL', 'https://swap-easy-app.vercel.app/')

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Обработчик команды /start
    Отправляет приветственное сообщение с кнопкой для запуска Mini App
    """
    user = update.effective_user
    
    # Приветственное сообщение
    welcome_text = f"""
👋 Привіт, {user.first_name}!

Ласкаво просимо до **SwapEasyApp** — платформи для обміну речами без грошей!

🎯 **Що можна робити:**
• ➕ Додавати свої кейси
• 🔍 Шукати цікаві речі
• ❤️ Додавати до вподобань
• 💬 Пропонувати обмін
• 📊 Переглядати історію обмінів

Натисніть кнопку нижче, щоб відкрити додаток! 🚀
    """
    
    # Создаем кнопку для запуска Mini App
    keyboard = [
        [InlineKeyboardButton(
            text="🚀 Відкрити SwapEasyApp",
            web_app=WebAppInfo(url=MINI_APP_URL)
        )]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    # Отправляем сообщение с кнопкой
    await update.message.reply_text(
        welcome_text,
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )


def main() -> None:
    """Запуск бота"""
    # Создаем приложение
    application = Application.builder().token(API_TOKEN).build()
    
    # Регистрируем обработчик команды /start
    application.add_handler(CommandHandler("start", start_command))
    
    # Запускаем бота
    print("🤖 Бот запущено! Натисніть Ctrl+C для зупинки.")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == '__main__':
    main()



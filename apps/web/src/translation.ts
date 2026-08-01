export interface Language {
    language_name?: string;
    chats?: string;
    log_out?: string;
    language?: string;
    sign_in?: string;
    have_account?: string;
    sign_up?: string;
    no_account?: string;
    welcome?: string;
    login?: string;
    email?: string;
    password?: string;
    confirm_password?: string;
    you?: string;
    your_message?: string;
    replying_to?: string;
    private_chat?: string;
    group_chat?: string;
    relogin?: string;
    relogin_msg?: string;
    ok?: string;
    settings?: string;
    now?: string;
    change_language?: string;
    clear_cache?: string;

    // Create Chat popup
    create_chat?: string;
    new_chat?: string;
    enter_username?: string;
    username_placeholder?: string;

    // Message dropdown
    message_actions?: string;
    cancel?: string;
    reply?: string;
    delete?: string;

    // Settings
    settings_general?: string;
    settings_language_time?: string;
    settings_appearance?: string;
    settings_cache?: string;
    settings_check_for_updates?: string;
    settings_language?: string;
    settings_24_hour_time?: string;
    settings_preview?: string;
    settings_change_theme?: string;
    settings_reset_theme?: string;

    // Time
    code?: string;
    yesterday?: string;

    // Profile
    profile?: string;
    edit?: string;
    apply?: string;

    // Auto Update
    update_available?: string;
    update?: string;
    later?: string;
    update_popup_content?: string;
    downloading_started?: string;
    download_completed?: string;
    tap_to_install?: string;
    no_update_available?: string;
    no_update_popup_content?: string;
}

class Translation {
    static lang: string = "en";

    static en: Language = {
        language_name: "English",
        chats: "Chats",
        log_out: "Log Out",
        language: "Language",
        sign_in: "Sign In",
        have_account: "Have Account?",
        sign_up: "Sign Up",
        no_account: "No Account?",
        welcome: "Welcome!",
        login: "Login",
        email: "Email",
        password: "Password",
        confirm_password: "Confirm Password",
        you: "You",
        your_message: "Your Message",
        replying_to: "Replying to message",
        private_chat: "Private Chat",
        group_chat: "Group Chat",
        relogin: "Relogin",
        relogin_msg: "Please relogin.",
        ok: "OK",
        settings: "Settings",
        now: "Now",
        change_language: "Change Language",
        clear_cache: "Clear Cache",

        // Create Chat popup
        create_chat: "Create Chat",
        new_chat: "New Chat",
        enter_username: "Enter username of the person you want to chat with:",
        username_placeholder: "Username",

        // Message dropdown
        message_actions: "Actions",
        cancel: "Cancel",
        reply: "Reply",
        delete: "Delete",

        // Settings
        settings_general: "General",
        settings_language_time: "Language & Time",
        settings_appearance: "Appearance",
        settings_cache: "Cache",
        settings_check_for_updates: "Check for Updates",
        settings_language: "Language",
        settings_24_hour_time: "Force 24-hour time",
        settings_preview: "Preview",
        settings_change_theme: "Change Theme",
        settings_reset_theme: "Reset Theme",

        // Time
        code: "en",
        yesterday: "Yesterday",

        // Profile
        profile: "Profile",
        edit: "Edit",
        apply: "Apply",

        // Auto Update
        update_available: "Update Available",
        update: "Update",
        later: "Later",
        update_popup_content: "Version [version] is available. Updating is highly recommended.",
        downloading_started: "Downloading started. Wait for the notification.",
        download_completed: "Download completed",
        tap_to_install: "Tap to install",
        no_update_available: "No update available",
        no_update_popup_content: "You are using the latest version.",
    };

    static ru: Language = {
        language_name: "Русский",
        chats: "Чаты",
        log_out: "Выйти",
        language: "Язык",
        sign_in: "Войти",
        have_account: "Уже есть аккаунт?",
        sign_up: "Зарегистрироваться",
        no_account: "Нет аккаунта?",
        welcome: "Здарова!",
        login: "Логин",
        email: "Почта",
        password: "Пароль",
        confirm_password: "Подтвердите пароль",
        you: "Вы",
        your_message: "Ваше сообщение",
        replying_to: "Ответ на сообщение",
        private_chat: "Личный чат",
        group_chat: "Групповой чат",
        relogin: "Перелогинтесь",
        relogin_msg: "Пожалуйста, зайдите в свой аккаунт снова.",
        ok: "OK",
        settings: "Опции",
        now: "Сейчас",
        change_language: "Сменить язык",
        clear_cache: "Очистить кэш",

        // Create Chat popup
        create_chat: "Создать чат",
        new_chat: "Новый чат",
        enter_username: "Введите имя пользователя, с которым хотите начать чат:",
        username_placeholder: "Имя пользователя",

        // Message dropdown
        message_actions: "Действия",
        cancel: "Отменить",
        reply: "Ответить",
        delete: "Удалить",

        // Settings
        settings_general: "Общие",
        settings_language_time: "Язык и время",
        settings_appearance: "Внешний вид",
        settings_cache: "Кэш",
        settings_check_for_updates: "Проверить на обновления",
        settings_language: "Язык",
        settings_24_hour_time: "Принудительный 24-часовой формат",
        settings_preview: "Предпросмотр",
        settings_change_theme: "Сменить тему",
        settings_reset_theme: "Сбросить тему",

        // Time
        code: "ru",
        yesterday: "Вчера",

        // Profile
        profile: "Профиль",
        edit: "Изменить",
        apply: "Сохранить",

        // Auto Update
        update_available: "Доступно обновление",
        update: "Обновить",
        later: "Позже",
        update_popup_content: "Версия [version] готова к загрузке. Обновите, как только будет возможность.",
        downloading_started: "Загрузка началась. Ожидайте уведомления.",
        download_completed: "Загрузка завершена",
        tap_to_install: "Нажмите, чтобы установить",
        no_update_available: "Нет обновлений",
        no_update_popup_content: "Вы используете последнюю версию.",
    };

    static ua: Language = {
        language_name: "Українська",
        chats: "Чати",
        log_out: "Вийти",
        language: "Мова",
        sign_in: "Увійти",
        have_account: "Вже є акаунт?",
        sign_up: "Зареєструватися",
        no_account: "Немає акаунту?",
        welcome: "Здоровенькі були!",
        login: "Логін",
        email: "Пошта",
        password: "Пароль",
        confirm_password: "Підтвердіть пароль",
        you: "Ви",
        your_message: "Ваше повідомлення",
        replying_to: "Відповідь на повідомлення",
        private_chat: "Особистий чат",
        group_chat: "Груповий чат",
        relogin: "Перелогинтесь",
        relogin_msg: "Будь ласка, зайдіть в свій акаунт повторно.",
        ok: "OK",
        settings: "Опції",
        now: "Зараз",
        change_language: "Змінити мову",
        clear_cache: "Очистити кеш",

        // Create Chat popup
        create_chat: "Створити чат",
        new_chat: "Новий чат",
        enter_username: "Введіть ім'я користувача, з яким ви хочете почати чат:",
        username_placeholder: "Ім'я користувача",

        // Message dropdown
        message_actions: "Дії",
        cancel: "Відмінити",
        reply: "Відповісти",
        delete: "Видалити",

        // Settings
        settings_general: "Загальні",
        settings_language_time: "Мова та час",
        settings_appearance: "Зовнішній вигляд",
        settings_cache: "Кеш",
        settings_check_for_updates: "Перевірити на оновлення",
        settings_language: "Мова",
        settings_24_hour_time: "Примусовий 24-годинний формат",
        settings_preview: "Попередній перегляд",
        settings_change_theme: "Змінити тему",
        settings_reset_theme: "Скинути тему",

        // Time
        code: "uk",
        yesterday: "Вчора",

        // Profile
        profile: "Профіль",
        edit: "Змінити",
        apply: "Зберегти",

        // Auto Update
        update_available: "Доступне оновлення",
        update: "Оновити",
        later: "Пізніше",
        update_popup_content: "Версія [version] готова до завантаження. Оновіть, як тільки буде можливість.",
        downloading_started: "Завантаження розпочато. Очікуйте на повідомлення.",
        download_completed: "Завантаження завершено",
        tap_to_install: "Натисніть, щоб встановити",
        no_update_available: "Немає оновлень",
        no_update_popup_content: "Ви використовуєте останню версію.",
    };

    static getCurrentTranslation(): Language {
        return (Translation as any)[Translation.lang] || Translation.en;
    }

    static getCurrentLanguage(): string {
        return Translation.lang;
    }

    static setCurrentLanguage(lang: string): void {
        Translation.lang = lang;
    }

    static init() {
        const storedLang = localStorage.getItem("language");
        if (storedLang) {
            Translation.setCurrentLanguage(storedLang);
        }
    }
}

export default Translation;

export const t: Language = new Proxy(
    {},
    {
        get(_, key: string): string {
            const current = Translation.getCurrentTranslation();
            return (current as any)[key] || (Translation.en as any)[key] || key;
        },
    },
);

export function changeLanguage(lang?: string): string {
    const current = Translation.getCurrentLanguage();
    let newLang: string = "";
    if (lang) {
        newLang = lang;
    } else if (current === "en") newLang = "ru";
    else if (current === "ru") newLang = "ua";
    else if (current === "ua") newLang = "en";
    localStorage.setItem("language", newLang);
    Translation.setCurrentLanguage(newLang);
    return newLang;
}

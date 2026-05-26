const tg = window.Telegram.WebApp;
let userId = null;
let initData = tg.initData || '';

try {
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        userId = tg.initDataUnsafe.user.id;
    }
} catch(e) {}

if (!userId) userId = 7617765563;

function addMessage(text, type) {
    const chat = document.getElementById('chat');
    const div = document.createElement('div');
    div.className = 'msg ' + type;
    let displayText = text.length > 500 ? text.substring(0, 500) + '...' : text;
    div.innerHTML = displayText.replace(/\n/g, '<br>');
    chat.appendChild(div);
    setTimeout(() => {
        chat.scrollTop = chat.scrollHeight;
    }, 10);
    return div;
}

function sendToAPI(payload, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', CONFIG.API_URL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.timeout = 10000;
    xhr.onload = () => {
        if (xhr.status === 200) {
            try {
                callback(null, JSON.parse(xhr.responseText));
            } catch(e) {
                callback('Ошибка ответа сервера', null);
            }
        } else {
            callback('HTTP ' + xhr.status, null);
        }
    };
    xhr.onerror = () => callback('Сервер недоступен', null);
    xhr.ontimeout = () => callback('Таймаут', null);
    xhr.send(JSON.stringify({
        ...payload,
        tg_data: initData,
        user_id: userId
    }));
}

function updateStatus(text, isOk) {
    const el = document.getElementById('onlineStatus');
    if (el) {
        el.textContent = text;
        el.style.color = isOk ? '#00ffb3' : '#ff6666';
    }
}

// utils.js
const tg = window.Telegram.WebApp;
let userId = null;
let initData = tg.initData || '';

try {
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        userId = tg.initDataUnsafe.user.id;
    }
} catch(e) {
    console.log('Error getting user:', e);
}

if (!userId) {
    userId = CONFIG.FALLBACK_USER_ID;
    console.log('Using fallback user_id:', userId);
}

function addMessage(text, type) {
    const chat = document.getElementById('chat');
    const div = document.createElement('div');
    div.className = 'msg ' + type;
    div.innerHTML = text.replace(/\n/g, '<br>');
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    return div;
}

function sendToAPI(payload, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', CONFIG.API_URL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = () => {
        if (xhr.status === 200) {
            callback(null, JSON.parse(xhr.responseText));
        } else {
            callback('HTTP ' + xhr.status, null);
        }
    };
    xhr.onerror = () => {
        callback('Сервер недоступен', null);
    };
    xhr.send(JSON.stringify({
        ...payload,
        tg_data: initData,
        user_id: userId
    }));
}

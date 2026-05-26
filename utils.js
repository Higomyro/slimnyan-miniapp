// utils.js
let chat, initData;

function initGlobals() {
    chat = document.getElementById('chat');
    initData = window.Telegram.WebApp.initData || '';
}

function add(text, type) {
    const div = document.createElement('div');
    div.className = 'msg ' + type;
    div.innerHTML = text.replace(/\n/g, '<br>');
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    return div;
}

function loadHello() {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', CONFIG.API_URL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = () => {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            if (data.reply) {
                chat.innerHTML = '';
                add(data.reply, 'bot');
            }
        }
    };
    xhr.send(JSON.stringify({ command: '/start', tg_data: initData }));
}

function sendRequest(payload, onSuccess) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', CONFIG.API_URL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = () => {
        if (xhr.status === 200) {
            onSuccess(JSON.parse(xhr.responseText));
        }
    };
    xhr.send(JSON.stringify(payload));
}

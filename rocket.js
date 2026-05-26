// main.js
tg.ready();
tg.expand();

const input = document.getElementById('cmdInput');

function loadHello() {
    sendToAPI({ command: '/start' }, (err, data) => {
        const chat = document.getElementById('chat');
        if (err) {
            chat.innerHTML = '<div class="msg bot">❌ Ошибка подключения к серверу. Запусти бота.</div>';
            return;
        }
        if (data.reply) {
            chat.innerHTML = '';
            addMessage(data.reply, 'bot');
        } else if (data.status === 'success' && data.reply) {
            chat.innerHTML = '';
            addMessage(data.reply, 'bot');
        }
    });
}

function sendCmd(explicitCmd) {
    const cmd = explicitCmd || input.value.trim();
    if (!cmd) return;
    addMessage(cmd, 'user');
    if (!explicitCmd) input.value = '';

    sendToAPI({ command: cmd }, (err, data) => {
        if (err) {
            addMessage('❌ ' + err, 'bot');
            return;
        }
        if (data.reply) {
            addMessage(data.reply, 'bot');
        } else if (data.status === 'success' && data.reply) {
            addMessage(data.reply, 'bot');
        } else if (data.message) {
            addMessage('❌ ' + data.message, 'bot');
        }
    });
}

input.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendCmd();
});

tg.MainButton.setText('Закрыть').show().onClick(() => tg.close());

loadHello();

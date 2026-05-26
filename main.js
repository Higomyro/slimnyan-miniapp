tg.ready();
tg.expand();

const input = document.getElementById('cmdInput');
const sendBtn = document.querySelector('.input-row .send-btn');

function loadHello() {
    updateStatus('🔄 соединение...', false);
    sendToAPI({ command: '/start' }, (err, data) => {
        if (err) {
            updateStatus('❌ ошибка', false);
            const chat = document.getElementById('chat');
            if (chat) chat.innerHTML = '<div class="msg bot">❌ ' + err + '</div>';
            return;
        }
        updateStatus('✅ online', true);
        const reply = data.reply || (data.status === 'success' ? data.reply : null);
        if (reply) {
            const chat = document.getElementById('chat');
            if (chat) {
                chat.innerHTML = '';
                addMessage(reply, 'bot');
            }
        }
    });
}

window.sendCmd = function(explicitCmd) {
    const cmd = explicitCmd || input.value.trim();
    if (!cmd) return;
    addMessage(cmd, 'user');
    if (!explicitCmd) input.value = '';

    sendToAPI({ command: cmd }, (err, data) => {
        if (err) {
            addMessage('❌ ' + err, 'bot');
            return;
        }
        let reply = data.reply || data.message;
        if (reply) {
            addMessage(reply, 'bot');
        } else if (data.status === 'success') {
            addMessage('✅ Выполнено', 'bot');
        } else {
            addMessage('❌ Неизвестная команда', 'bot');
        }
    });
};

if (sendBtn) {
    sendBtn.onclick = () => window.sendCmd();
}

input.addEventListener('keypress', e => {
    if (e.key === 'Enter') window.sendCmd();
});

tg.MainButton.setText('Закрыть').show().onClick(() => tg.close());

loadHello();

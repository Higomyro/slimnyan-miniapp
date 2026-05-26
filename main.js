tg.ready();
tg.expand();

const input = document.getElementById('cmdInput');

function loadHello() {
    updateStatus('🔄 соединение...', false);
    sendToAPI({ command: '/start' }, (err, data) => {
        if (err) {
            updateStatus('❌ ошибка', false);
            document.getElementById('chat').innerHTML = '<div class="msg bot">❌ ' + err + '</div>';
            return;
        }
        updateStatus('✅ online', true);
        const reply = data.reply || (data.status === 'success' ? data.reply : null);
        if (reply) {
            document.getElementById('chat').innerHTML = '';
            addMessage(reply, 'bot');
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
        let reply = data.reply || data.message;
        if (reply) {
            addMessage(reply, 'bot');
        } else if (data.status === 'success') {
            addMessage('✅ Выполнено', 'bot');
        } else {
            addMessage('❌ Неизвестная команда', 'bot');
        }
    });
}

input.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendCmd();
});

tg.MainButton.setText('Закрыть').show().onClick(() => tg.close());

loadHello();

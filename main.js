// main.js
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

initGlobals();

function sendCmd(explicitCmd) {
    const input = document.getElementById('cmdInput');
    const cmd = explicitCmd || input.value.trim();
    if (!cmd) return;
    
    add(cmd, 'user');
    if (!explicitCmd) input.value = '';

    sendRequest({
        command: cmd,
        tg_data: initData
    }, (data) => {
        if (data.reply) add(data.reply, 'bot');
        else if (data.message) add('❌ ' + data.message, 'bot');
    }, () => {
        add('❌ Ошибка соединения', 'bot');
    });
}

document.getElementById('cmdInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') sendCmd();
});

tg.MainButton.setText('Закрыть').show().onClick(() => tg.close());

loadHello();

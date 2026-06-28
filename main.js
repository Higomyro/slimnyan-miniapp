tg.ready();
tg.expand();

const input = document.getElementById('cmdInput');
const sendBtn = document.querySelector('.input-row .send-btn');

function loadHello() {
    updateStatus('🔄 соединение...');
    sendToAPI({ command: '/start' }, (err, data) => {
        if (err) {
            updateStatus('❌ ошибка');
            const chat = document.getElementById('chat');
            if (chat) chat.innerHTML = '<div class="msg bot">❌ ' + err + '</div>';
            return;
        }
        updateStatus('online');
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

// ===== СТАТИСТИКА (ВЫДВИЖНОЙ СЛОЙ) =====

function showStats() {
    const overlay = document.getElementById('statsOverlay');
    overlay.classList.add('active');
    
    const img = document.getElementById('statsImage');
    const loading = document.getElementById('statsLoading');
    
    img.style.display = 'none';
    loading.style.display = 'block';
    loading.textContent = '⏳ Генерация статистики...';
    
    // Запрашиваем статистику через бота
    sendToAPI({ command: 'статистика' }, (err, data) => {
        if (err) {
            loading.textContent = '❌ ' + err;
            return;
        }
        
        let reply = data.reply || data.message || '';
        // Если пришла ссылка на фото или текст - показываем
        if (reply.includes('http') && (reply.includes('.png') || reply.includes('.jpg') || reply.includes('.jpeg'))) {
            img.src = reply;
            img.style.display = 'block';
            loading.style.display = 'none';
        } else {
            // Если пришёл текст - показываем его
            loading.style.display = 'none';
            // Создаём текстовый блок вместо картинки
            const container = document.getElementById('statsImageContainer');
            const textDiv = document.createElement('div');
            textDiv.style.cssText = 'color:#ddd; font-size:14px; line-height:1.6; max-width:100%; word-wrap:break-word;';
            textDiv.innerHTML = reply.replace(/\n/g, '<br>');
            // Удаляем старые текстовые блоки
            const oldTexts = container.querySelectorAll('.stats-text');
            oldTexts.forEach(el => el.remove());
            textDiv.className = 'stats-text';
            container.appendChild(textDiv);
        }
    });
}

function refreshStats() {
    // Перезапускаем статистику
    const img = document.getElementById('statsImage');
    const loading = document.getElementById('statsLoading');
    const container = document.getElementById('statsImageContainer');
    
    img.style.display = 'none';
    loading.style.display = 'block';
    loading.textContent = '🔄 Перезапуск...';
    
    // Удаляем старые текстовые блоки
    const oldTexts = container.querySelectorAll('.stats-text');
    oldTexts.forEach(el => el.remove());
    
    // Повторный запрос
    sendToAPI({ command: 'статистика' }, (err, data) => {
        if (err) {
            loading.textContent = '❌ ' + err;
            return;
        }
        
        let reply = data.reply || data.message || '';
        if (reply.includes('http') && (reply.includes('.png') || reply.includes('.jpg') || reply.includes('.jpeg'))) {
            img.src = reply;
            img.style.display = 'block';
            loading.style.display = 'none';
        } else {
            loading.style.display = 'none';
            const textDiv = document.createElement('div');
            textDiv.style.cssText = 'color:#ddd; font-size:14px; line-height:1.6; max-width:100%; word-wrap:break-word;';
            textDiv.innerHTML = reply.replace(/\n/g, '<br>');
            textDiv.className = 'stats-text';
            container.appendChild(textDiv);
        }
    });
}

function closeOverlay() {
    document.getElementById('statsOverlay').classList.remove('active');
}

// Закрытие по клику вне контента
document.getElementById('statsOverlay').addEventListener('click', function(e) {
    if (e.target === this) {
        closeOverlay();
    }
});

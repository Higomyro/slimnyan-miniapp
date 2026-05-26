let rocketMsg = null;
let rocketInterval = null;
let currentBet = 0;

function startRocket() {
    const row = document.getElementById('rocketBetRow');
    if (row) row.style.display = row.style.display === 'flex' ? 'none' : 'flex';
}

function launchRocket() {
    const betInput = document.getElementById('betInput');
    const bet = betInput ? parseInt(betInput.value) || 100 : 100;
    if (bet <= 0) {
        addMessage('❌ Ставка должна быть больше 0', 'bot');
        return;
    }
    const row = document.getElementById('rocketBetRow');
    if (row) row.style.display = 'none';

    sendToAPI({ action: 'rocket_start', bet: bet }, (err, data) => {
        if (err) {
            addMessage('❌ ' + err, 'bot');
            return;
        }
        if (data.status === 'success' && data.message === 'rocket started') {
            currentBet = bet;
            rocketMsg = addMessage(
                '🚀 РАКЕТА ВЗЛЕТАЕТ\n\n💰 Ставка: ' + bet + '🪙\n📈 x1.00\n🟢 Шанс: 97%',
                'rocket'
            );

            // Кнопка ЗАБРАТЬ
            const cashoutBtn = document.createElement('button');
            cashoutBtn.className = 'cashout-btn';
            cashoutBtn.textContent = '💰 ЗАБРАТЬ ВЫИГРЫШ';
            cashoutBtn.onclick = () => cashoutRocket();
            rocketMsg.appendChild(cashoutBtn);

            // Кнопка ПРОПУСТИТЬ (всегда есть с самого начала)
            const skipBtn = document.createElement('button');
            skipBtn.className = 'skip-btn';
            skipBtn.textContent = '⏭ ПРОПУСТИТЬ';
            skipBtn.onclick = () => skipRocket();
            rocketMsg.appendChild(skipBtn);

            startRocketPolling();
        } else {
            addMessage('❌ ' + (data.message || 'Ошибка запуска'), 'bot');
        }
    });
}

function startRocketPolling() {
    if (rocketInterval) clearInterval(rocketInterval);
    rocketInterval = setInterval(() => {
        sendToAPI({ action: 'rocket_state' }, (err, data) => {
            if (err || !data || data.status === 'error') {
                if (rocketInterval) clearInterval(rocketInterval);
                return;
            }
            if (!rocketMsg) {
                if (rocketInterval) clearInterval(rocketInterval);
                return;
            }
            if (data.active) {
                const mult = data.multiplier;
                const pot = Math.floor(currentBet * mult);
                rocketMsg.innerHTML = '🚀 РАКЕТА ВЗЛЕТАЕТ<br><br>💰 Ставка: ' + currentBet + '🪙<br>📈 x' + mult + '<br>💎 ' + pot + '🪙';

                // Удаляем старые кнопки
                const oldBtns = rocketMsg.querySelectorAll('button');
                oldBtns.forEach(btn => btn.remove());

                // Добавляем свежие
                const cashoutBtn = document.createElement('button');
                cashoutBtn.className = 'cashout-btn';
                cashoutBtn.textContent = '💰 ЗАБРАТЬ ВЫИГРЫШ';
                cashoutBtn.onclick = () => cashoutRocket();
                rocketMsg.appendChild(cashoutBtn);

                const skipBtn = document.createElement('button');
                skipBtn.className = 'skip-btn';
                skipBtn.textContent = '⏭ ПРОПУСТИТЬ';
                skipBtn.onclick = () => skipRocket();
                rocketMsg.appendChild(skipBtn);
            } else {
                if (rocketInterval) clearInterval(rocketInterval);
                if (data.cashed_out) {
                    rocketMsg.innerHTML = '✅ ВЫ ЗАБРАЛИ ВЫИГРЫШ<br><br>💰 Выигрыш зачислен';
                } else {
                    rocketMsg.innerHTML = '💥 РАКЕТА ВЗОРВАЛАСЬ<br><br>😢 Ставка ' + currentBet + '🪙 сгорела';
                }
                rocketMsg = null;
            }
        });
    }, 700);
}

function cashoutRocket() {
    sendToAPI({ action: 'rocket_cashout' }, () => {
        if (rocketMsg) {
            rocketMsg.innerHTML = '✅ КЭШАУТ УСПЕШЕН<br><br>💰 Выигрыш зачислен';
            if (rocketInterval) clearInterval(rocketInterval);
            rocketMsg = null;
        }
    });
}

function skipRocket() {
    if (rocketMsg) {
        rocketMsg.innerHTML = '⏭ АНИМАЦИЯ ПРОПУЩЕНА<br><br>💰 Результат в чате бота';
        if (rocketInterval) clearInterval(rocketInterval);
        rocketMsg = null;
    }
}

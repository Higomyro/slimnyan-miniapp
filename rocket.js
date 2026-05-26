// rocket.js
let rocketMsg = null;
let rocketInterval = null;
let currentRocketBet = 0;

function startRocket() {
    const row = document.getElementById('rocketBetRow');
    row.style.display = row.style.display === 'flex' ? 'none' : 'flex';
}

function launchRocket() {
    const bet = parseInt(document.getElementById('betInput').value) || 100;
    document.getElementById('rocketBetRow').style.display = 'none';

    sendToAPI({ action: 'rocket_start', bet: bet }, (err, data) => {
        if (err) {
            addMessage('❌ ' + err, 'bot');
            return;
        }
        if (data.status === 'success' && data.message === 'rocket started') {
            currentRocketBet = bet;
            rocketMsg = addMessage(
                `🚀 РАКЕТА ВЗЛЕТАЕТ\n\n💰 Ставка: ${bet}🪙\n\n📈 x1.00\n🟢 Шанс: 97%\n\n💎 Ожидаем...`,
                'rocket'
            );
            const cashoutBtn = document.createElement('button');
            cashoutBtn.className = 'cashout-btn';
            cashoutBtn.textContent = '💰 ЗАБРАТЬ ВЫИГРЫШ';
            cashoutBtn.onclick = () => cashoutRocket();
            rocketMsg.appendChild(cashoutBtn);
            
            const skipBtn = document.createElement('button');
            skipBtn.className =skip-btn';
            skipBtn.textContent = '⏭ ПРОПУСТИТЬ АНИМАЦИЮ';
            skipBtn.onclick = () => skipRocket();
            rocketMsg.appendChild(skipBtn);
            
            updateRocketState();
        } else if (data.message) {
            addMessage('❌ ' + data.message, 'bot');
        } else {
            addMessage('❌ Ошибка запуска ракеты', 'bot');
        }
    });
}

function updateRocketState() {
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
                const pot = Math.floor(currentRocketBet * mult);
                rocketMsg.innerHTML = `🚀 РАКЕТА ВЗЛЕТАЕТ<br><br>💰 Ставка: ${currentRocketBet}🪙<br><br>📈 x${mult}<br>💎 ${pot}🪙`;
            } else {
                if (rocketInterval) clearInterval(rocketInterval);
                if (data.cashed_out) {
                    rocketMsg.innerHTML = `✅ ВЫ ЗАБРАЛИ ВЫИГРЫШ<br><br>💰 ${currentRocketBet}🪙`;
                } else {
                    rocketMsg.innerHTML = `💥 РАКЕТА ВЗОРВАЛАСЬ<br><br>😢 Ставка ${currentRocketBet}🪙 сгорела`;
                    rocketMsg = null;
                }
            }
        });
    }, 600);
}

function cashoutRocket() {
    sendToAPI({ action: 'rocket_cashout' }, (err, data) => {
        if (err) {
            addMessage('❌ ' + err, 'bot');
            return;
        }
        if (rocketMsg) {
            rocketMsg.innerHTML = `✅ КЭШАУТ УСПЕШЕН<br><br>💰 Выигрыш сохранён`;
            if (rocketInterval) clearInterval(rocketInterval);
        }
    });
}

function skipRocket() {
    sendToAPI({ action: 'rocket_skip' }, (err, data) => {
        if (rocketMsg) {
            rocketMsg.innerHTML = `⏭ АНИМАЦИЯ ПРОПУЩЕНА<br><br>💰 Результат в чате бота`;
            if (rocketInterval) clearInterval(rocketInterval);
        }
    });
}

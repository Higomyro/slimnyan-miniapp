let rocketMsg = null;
let rocketInterval = null;
let currentBet = 0;

function startRocket() {
    const row = document.getElementById('rocketBetRow');
    row.style.display = row.style.display === 'flex' ? 'none' : 'flex';
}

function launchRocket() {
    const bet = parseInt(document.getElementById('betInput').value) || 100;
    if (bet <= 0) {
        addMessage('❌ Ставка должна быть больше 0', 'bot');
        return;
    }
    document.getElementById('rocketBetRow').style.display = 'none';

    sendToAPI({ action: 'rocket_start', bet: bet }, (err, data) => {
        if (err) {
            addMessage('❌ ' + err, 'bot');
            return;
        }
        if (data.status === 'success' && data.message === 'rocket started') {
            currentBet = bet;
            rocketMsg = addMessage(
                `🚀 РАКЕТА ВЗЛЕТАЕТ\n\n💰 Ставка: ${bet}🪙\n📈 x1.00\n🟢 Шанс: 97%`,
                'rocket'
            );
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
                rocketMsg.innerHTML = `🚀 РАКЕТА ВЗЛЕТАЕТ<br><br>💰 Ставка: ${currentBet}🪙<br>📈 x${mult}<br>💎 ${pot}🪙`;
                const oldBtns = rocketMsg.querySelectorAll('button');
                oldBtns.forEach(btn => btn.remove());
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
                    rocketMsg.innerHTML = `✅ ВЫ ЗАБРАЛИ ВЫИГРЫШ<br><br>💰 Выигрыш зачислен`;
                } else {
                    rocketMsg.innerHTML = `💥 РАКЕТА ВЗОРВАЛАСЬ<br><br>😢 Ставка ${currentBet}🪙 сгорела`;
                }
                rocketMsg = null;
            }
        });
    }, 700);
}

function cashoutRocket() {
    sendToAPI({ action: 'rocket_cashout' }, (err, data) => {
        if (rocketMsg) {
            rocketMsg.innerHTML = `✅ КЭШАУТ УСПЕШЕН<br><br>💰 Выигрыш зачислен`;
            if (rocketInterval) clearInterval(rocketInterval);
            rocketMsg = null;
        }
    });
}

function skipRocket() {
    sendToAPI({ action: 'rocket_skip' }, (err, data) => {
        if (rocketMsg) {
            rocketMsg.innerHTML = `⏭ АНИМАЦИЯ ПРОПУЩЕНА<br><br>💰 Результат в чате бота`;
            if (rocketInterval) clearInterval(rocketInterval);
            rocketMsg = null;
        }
    });
}

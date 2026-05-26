// rocket.js
let rocketMsg = null;
let rocketInterval = null;

function startRocket() {
    const row = document.getElementById('rocketBetRow');
    row.style.display = row.style.display === 'flex' ? 'none' : 'flex';
}

function launchRocket() {
    const bet = parseInt(document.getElementById('betInput').value) || 100;
    document.getElementById('rocketBetRow').style.display = 'none';

    sendRequest({
        action: 'rocket_start',
        bet: bet,
        tg_data: initData
    }, (data) => {
        if (data.status === 'success' && data.game) {
            rocketMsg = add(
                `🚀 РАКЕТА ВЗЛЕТАЕТ\n\n💰 Ставка: ${bet}🪙\n\n📈 x1.00\n🟢 Шанс: 97%\n\n💎 Потенциал растёт...`,
                'rocket'
            );
            const cashoutBtn = document.createElement('button');
            cashoutBtn.className = 'cashout-btn';
            cashoutBtn.textContent = '💰 ЗАБРАТЬ ВЫИГРЫШ';
            cashoutBtn.onclick = cashoutRocket;
            rocketMsg.appendChild(cashoutBtn);
            updateRocketState(bet);
        } else {
            add('❌ ' + (data.message || 'Ошибка'), 'bot');
        }
    });
}

function updateRocketState(bet) {
    if (rocketInterval) clearInterval(rocketInterval);
    rocketInterval = setInterval(() => {
        sendRequest({
            action: 'rocket_state',
            tg_data: initData
        }, (data) => {
            if (!rocketMsg) {
                clearInterval(rocketInterval);
                return;
            }
            if (data.status === 'success' && data.active && !data.cashed_out) {
                const mult = data.multiplier;
                const pot = data.potential || Math.floor(bet * mult);
                rocketMsg.innerHTML = `🚀 РАКЕТА ВЗЛЕТАЕТ<br><br>💰 Ставка: ${bet}🪙<br><br>📈 x${mult}<br>💎 ${pot}🪙`;
            } else {
                clearInterval(rocketInterval);
                if (data.cashed_out) {
                    rocketMsg.innerHTML = `✅ ВЫ ЗАБРАЛИ ВЫИГРЫШ<br><br>💰 ${data.winnings}🪙`;
                } else {
                    rocketMsg.innerHTML = `💥 РАКЕТА ВЗОРВАЛАСЬ<br><br>😢 Ставка ${bet}🪙 сгорела`;
                    rocketMsg = null;
                }
            }
        });
    }, 600);
}

function cashoutRocket() {
    sendRequest({
        action: 'rocket_cashout',
        tg_data: initData
    }, (data) => {
        if (data.status === 'success' && rocketMsg) {
            rocketMsg.innerHTML = `✅ КЭШАУТ УСПЕШЕН<br><br>💰 ${data.winnings}🪙`;
            clearInterval(rocketInterval);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    let num1, num2, num3, correctAnswer, changeAnswer;
    let item1, item2, item3;
    let boxItems = [];
    let paidMoney = [];
    let selectedNumber = '';
    let currentLevel = 1;
    const maxLevels = 40;
    const maxItems = 15;
    let currentLanguage = 'zh';
    let totalQuestions = 0;
    let correctQuestions = 0;
    let isAnswerCorrect = false;

    // 物品價格和名稱
    const itemValues = {
        chips: 20,
        cola: 10,
        candy: 1,
        milk: 5
    };

    const itemNames = {
        zh: {
            chips: '包薯片',
            cola: '罐可樂',
            candy: '粒糖果',
            milk: '罐牛奶'
        },
        en: {
            chips: 'Chips',
            cola: 'Cola',
            candy: 'Candy',
            milk: 'Milk'
        }
    };

    // 載入遊戲狀態
    function loadGameState() {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            const state = JSON.parse(savedState);
            currentLevel = state.currentLevel || 1;
            totalQuestions = state.totalQuestions || 0;
            correctQuestions = state.correctQuestions || 0;
            currentLanguage = state.currentLanguage || 'zh';
        }
    }

    // 保存遊戲狀態
    function saveGameState() {
        const state = {
            currentLevel,
            totalQuestions,
            correctQuestions,
            currentLanguage
        };
        localStorage.setItem('gameState', JSON.stringify(state));
    }

    // 數字轉文字（語音用）
    function numberToText(number, language) {
        const numberDict = {
            zh: {
                0: '零', 1: '一', 2: '二', 3: '三', 4: '四', 5: '五',
                6: '六', 7: '七', 8: '八', 9: '九', 10: '十', 20: '二十', 50: '五十', 100: '一百'
            },
            en: {
                0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
                6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 20: 'twenty', 50: 'fifty', 100: 'one hundred'
            }
        };
        return numberDict[language][number] || number.toString();
    }

    // 語言字典
    const langDict = {
        zh: {
            confirm: '確認',
            resetanw: '更正',
            noItem: '請將物品拖到購物籃！',
            noNumber: '請選擇數字！',
            correct: '答對了！',
            incorrect: '答錯了！',
            complete: '恭喜完成遊戲！',
            home: '回到主頁',
            level: '關卡',
            reset: '重置',
            resetConfirm: '確定要重置遊戲記錄嗎？',
            welcomePrompt: '歡迎嚟到購物冒險遊戲！請拖曳物品去答題！',
            questionPrompt: '幫媽媽攞{num1}{item1}放落購物籃',
            secondPrompt: '小朋友想要多{num2}{item2}',
            thirdPrompt: '小朋友仲想要多{num3}{item3}',
            totalPrompt: '一共要幾多錢？',
            moneyPrompt: '小朋友你要比多少錢呀？請將錢拖到收銀員！',
            changePrompt: '要找番多少比小朋友？',
            tryAgain: '可以再試一下',
            listenAgain: '🔊聽一次'
        },
        en: {
            confirm: 'Confirm',
            resetanw: 'Reset',
            noItem: 'Drag items to the shopping basket!',
            noNumber: 'Please select a number!',
            correct: 'Correct!',
            incorrect: 'Incorrect!',
            complete: 'Congratulations, game completed!',
            home: 'Back to Home',
            level: 'Level',
            reset: 'Reset',
            resetConfirm: 'Are you sure you want to reset game progress?',
            welcomePrompt: 'Welcome to the Shopping Adventure Game! Please drag items to answer!',
            questionPrompt: 'Help mom get {num1} {item1} to the shopping basket',
            secondPrompt: 'You want {num2} more {item2}',
            thirdPrompt: 'You also want {num3} more {item3}',
            totalPrompt: 'How much money in total?',
            moneyPrompt: 'How much money do you need to pay? Drag the money to the cashier!',
            changePrompt: 'How much change should I give back to the kid?',
            tryAgain: 'You can try again',
            listenAgain: '🔊Listen'
        }
    };

    // 語音函數
    function speak(text) {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = currentLanguage === 'zh' ? 'zh-HK' : 'en-US';
            utterance.volume = 1;
            utterance.rate = 1;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
        }
    }

    // 更新語言文字
    function updateLanguage() {
        document.getElementById('confirm-button').textContent = langDict[currentLanguage].confirm;
        document.getElementById('resetanw').textContent = langDict[currentLanguage].resetanw;
        document.getElementById('complete-message').textContent = langDict[currentLanguage].complete;
        document.getElementById('home-button').textContent = langDict[currentLanguage].home;
        document.getElementById('level-display').childNodes[0].textContent = `${langDict[currentLanguage].level}: `;
        document.getElementById('lang-toggle').textContent = currentLanguage === 'zh' ? '中/Eng' : 'Eng/中';
        document.getElementById('reset-button').textContent = langDict[currentLanguage].reset;
        document.getElementById('listen-again').textContent = langDict[currentLanguage].listenAgain;
        const feedback = document.getElementById('feedback');
        if (feedback.style.display !== 'none') {
            feedback.textContent = feedback.textContent === langDict['zh'].correct || feedback.textContent === langDict['en'].correct
                ? langDict[currentLanguage].correct
                : feedback.textContent === langDict['zh'].incorrect || feedback.textContent === langDict['en'].incorrect
                    ? langDict[currentLanguage].incorrect
                    : langDict[currentLanguage].noItem;
        }
        updateMathQuestionDisplay();
        updateCashRegister();
        updateCashCalculator();
    }

    // 更新關卡顯示
    function updateLevelDisplay() {
        const levelDisplay = document.getElementById('level-display');
        levelDisplay.className = `level-display level-${currentLevel}`;
        document.getElementById('level-counter').textContent = currentLevel;
        updateLanguage();
    }

    // 切換語言
    document.getElementById('lang-toggle').addEventListener('click', () => {
        currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
        updateLanguage();
        saveGameState();
    });

    // 重置遊戲
    document.getElementById('reset-button').addEventListener('click', () => {
        const confirmReset = confirm(langDict[currentLanguage].resetConfirm);
        if (confirmReset) {
            localStorage.removeItem('gameState');
            currentLevel = 1;
            totalQuestions = 0;
            correctQuestions = 0;
            generateQuestion();
            saveGameState();
        }
    });

    // 更新數學問題顯示
    function updateMathQuestionDisplay() {
        const mathQuestion = document.querySelector('.math-question');
        if (!mathQuestion) {
            console.error('Math question element not found');
            return;
        }
        mathQuestion.innerHTML = `
            <button id="listen-again">${langDict[currentLanguage].listenAgain}</button>
            <span id="num1">${num1}</span><span id="item1">${itemNames[currentLanguage][item1]}</span> + 
            <span id="num2">${num2}</span><span id="item2">${itemNames[currentLanguage][item2]}</span> + 
            <span id="num3">${num3}</span><span id="item3">${itemNames[currentLanguage][item3]}</span> =
            <div id="answer-box" class="answer-box">${selectedNumber}</div>
            <button id="confirm-button">${langDict[currentLanguage].confirm}</button>
            <button id="resetanw">${langDict[currentLanguage].resetanw}</button>
        `;
        // 重新綁定事件監聽器
        document.getElementById('listen-again').addEventListener('click', () => {
            const num1Text = numberToText(num1, currentLanguage);
            const promptText = langDict[currentLanguage].questionPrompt
                .replace(/\{num1\}/g, num1Text)
                .replace(/\{item1\}/g, itemNames[currentLanguage][item1]);
            speak(promptText);
        });
        document.getElementById('resetanw').addEventListener('click', () => {
            selectedNumber = '';
            document.getElementById('answer-box').textContent = selectedNumber;
            console.log('Reset answer clicked, selectedNumber:', selectedNumber);
        });
        document.getElementById('confirm-button').addEventListener('click', handleConfirmClick);
        const answerBox = document.getElementById('answer-box');
        answerBox.className = 'answer-box' + (boxItems.length > 0 ? '' : ' dashed-box');
    }

    // 處理確認按鈕點擊
    function handleConfirmClick() {
        console.log('Confirm button clicked', { selectedNumber, boxItems, isAnswerCorrect });
        const feedback = document.getElementById('feedback');
        const item1Count = boxItems.filter(item => item.type === item1).length;
        const item2Count = boxItems.filter(item => item.type === item2).length;
        const item3Count = boxItems.filter(item => item.type === item3).length;

        if (!isAnswerCorrect) {
            if (item1Count !== num1 || item2Count !== num2 || item3Count !== num3) {
                feedback.textContent = langDict[currentLanguage].noItem;
                feedback.className = 'feedback incorrect';
                feedback.style.display = 'block';
                setTimeout(() => {
                    feedback.style.display = 'none';
                }, 2000);
                console.log('Incorrect items:', { item1Count, item2Count, item3Count, num1, num2, num3 });
            } else if (selectedNumber.length < 1) {
                feedback.textContent = langDict[currentLanguage].noNumber;
                feedback.className = 'feedback incorrect';
                feedback.style.display = 'block';
                setTimeout(() => {
                    feedback.style.display = 'none';
                }, 2000);
                console.log('No number selected');
            } else {
                checkAnswer(parseInt(selectedNumber));
            }
        } else {
            checkChangeAnswer(parseInt(selectedNumber));
        }
    }

    // 更新收銀機顯示
    function updateCashRegister() {
        const cashDisplay = document.getElementById('cash-display');
        let displayText = '';
        boxItems.forEach(item => {
            const itemName = itemNames[currentLanguage][item.type];
            displayText += `<div class="cash-item"><span>${itemName}</span><span>$${item.value}</span></div>`;
        });
        cashDisplay.innerHTML = displayText;
    }

    // 更新收銀計算器顯示
    function updateCashCalculator() {
        const cashCalculator = document.getElementById('cash-calculator');
        if (paidMoney.length > 0 && isAnswerCorrect) {
            const totalPaid = paidMoney.reduce((sum, money) => sum + money.value, 0);
            cashCalculator.innerHTML = `${totalPaid} - ${correctAnswer} = <div id="change-answer" class="answer-box">${selectedNumber}</div>`;
        } else {
            cashCalculator.innerHTML = '';
        }
    }

    // 數字格點擊
    const numberCells = document.querySelectorAll('.number-cell');
    numberCells.forEach(cell => {
        cell.addEventListener('click', () => {
            const number = cell.getAttribute('data-number');
            if (selectedNumber.length < 2) {
                selectedNumber += number;
                if (isAnswerCorrect) {
                    document.getElementById('change-answer').textContent = selectedNumber;
                } else {
                    document.getElementById('answer-box').textContent = selectedNumber;
                }
                console.log('Number selected:', selectedNumber);
            }
        });
    });

    // 初始化拖曳功能
    function initializeDragListeners() {
        const items = document.querySelectorAll('.nut, .money, .change-money');
        items.forEach(item => {
            item.removeEventListener('dragstart', handleDragStart);
            item.removeEventListener('drag', handleDrag);
            item.removeEventListener('dragend', handleDragEnd);
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('drag', handleDrag);
            item.addEventListener('dragend', handleDragEnd);
        });
        console.log('Drag listeners initialized for:', items.length, 'items');
    }

    function handleDragStart(e) {
        const item = e.target;
        item.classList.add('dragging');
        const target = item.classList.contains('nut') ? document.getElementById('box') : document.getElementById('hamster');
        updateGuideLine(e, target);
        document.getElementById('guide-line').style.display = 'block';
        requestAnimationFrame(() => updateGuideLine(e, target));
        console.log('Drag started for:', item.className, item.getAttribute('data-value'));
    }

    function handleDrag(e) {
        const item = e.target;
        const target = item.classList.contains('nut') ? document.getElementById('box') : document.getElementById('hamster');
        updateGuideLine(e, target);
    }

    function handleDragEnd(e) {
        const item = e.target;
        item.classList.remove('dragging');
        document.getElementById('guide-line').style.display = 'none';
        console.log('Drag ended for:', item.className);
    }

    // 更新引導線
    function updateGuideLine(event, target) {
        const guideLine = document.getElementById('guide-line');
        const gameArea = document.querySelector('.game-area');
        const gameAreaRect = gameArea.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const startX = event.clientX - gameAreaRect.left;
        const startY = event.clientY - gameAreaRect.top;
        const endX = targetRect.left + targetRect.width / 2 - gameAreaRect.left;
        const endY = targetRect.top + targetRect.height / 2 - gameAreaRect.top;
        const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;

        guideLine.style.width = `${length}px`;
        guideLine.style.left = `${startX}px`;
        guideLine.style.top = `${startY}px`;
        guideLine.style.transform = `rotate(${angle}deg)`;
    }

    // 顯示引導線（從 money-area 到 hamster）
    function showMoneyGuideLine() {
        const moneyArea = document.querySelector('.money-area');
        const hamster = document.getElementById('hamster');
        const guideLine = document.getElementById('guide-line');
        const gameArea = document.querySelector('.game-area');
        const moneyAreaRect = moneyArea.getBoundingClientRect();
        const hamsterRect = hamster.getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();

        const startX = moneyAreaRect.left + moneyAreaRect.width / 2 - gameAreaRect.left;
        const startY = moneyAreaRect.top + moneyAreaRect.height / 2 - gameAreaRect.top;
        const endX = hamsterRect.left + hamsterRect.width / 2 - gameAreaRect.left;
        const endY = hamsterRect.top - 20 - gameAreaRect.top;

        const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;

        guideLine.style.width = `${length}px`;
        guideLine.style.left = `${startX}px`;
        guideLine.style.top = `${startY}px`;
        guideLine.style.transform = `rotate(${angle}deg)`;
        guideLine.style.transformOrigin = '0 0';
        guideLine.style.display = 'block';

        let opacity = 1;
        const blinkInterval = setInterval(() => {
            opacity = opacity === 1 ? 0.5 : 1;
            guideLine.style.opacity = opacity;
        }, 500);

        const moneyItems = document.querySelectorAll('.money');
        moneyItems.forEach(item => {
            item.removeEventListener('dragstart', handleMoneyDragStart);
            item.addEventListener('dragstart', handleMoneyDragStart);
        });

        function handleMoneyDragStart() {
            clearInterval(blinkInterval);
            guideLine.style.opacity = 1;
            guideLine.style.display = 'block';
        }

        hamster.removeEventListener('drop', handleHamsterDrop);
        hamster.addEventListener('drop', handleHamsterDrop);

        function handleHamsterDrop() {
            clearInterval(blinkInterval);
            guideLine.style.display = 'none';
        }
    }

    // 生成新數學問題
    function generateQuestion() {
        const items = ['chips', 'cola', 'candy', 'milk'];
        do {
            const shuffledItems = items.sort(() => Math.random() - 0.5);
            item1 = shuffledItems[0];
            item2 = shuffledItems[1];
            item3 = shuffledItems[2];
            num1 = Math.floor(Math.random() * 5) + 1;
            num2 = Math.floor(Math.random() * 5) + 1;
            num3 = Math.floor(Math.random() * 5) + 1;
            correctAnswer = num1 * itemValues[item1] + num2 * itemValues[item2] + num3 * itemValues[item3];
        } while (correctAnswer < 0 || correctAnswer > 99 || num1 + num2 + num3 > maxItems);

        document.getElementById('num1').textContent = num1;
        document.getElementById('num2').textContent = num2;
        document.getElementById('num3').textContent = num3;
        document.getElementById('answer-box').textContent = '';
        document.getElementById('box-nuts').innerHTML = '';
        document.getElementById('cash-display').innerHTML = '';
        document.getElementById('cash-calculator').innerHTML = '';
        document.getElementById('hamster-nuts').innerHTML = '';
        boxItems = [];
        paidMoney = [];
        selectedNumber = '';
        isAnswerCorrect = false;

        const allItems = document.querySelectorAll('.nut, .money, .change-money');
        allItems.forEach(item => {
            item.style.display = 'block';
            item.setAttribute('draggable', 'true');
        });

        document.getElementById('feedback').style.display = 'none';
        document.getElementById('game-complete').style.display = 'none';
        document.getElementById('guide-line').style.display = 'none';
        document.querySelector('.change-area').style.display = 'none';
        document.querySelector('#box').style.display = 'block';
        document.querySelector('.money-area').style.display = 'flex';
        updateLevelDisplay();
        updateMathQuestionDisplay();
        initializeDragListeners();
        saveGameState();

        const num1Text = numberToText(num1, currentLanguage);
        const promptText = langDict[currentLanguage].questionPrompt
            .replace(/\{num1\}/g, num1Text)
            .replace(/\{item1\}/g, itemNames[currentLanguage][item1]);
        speak(promptText);
    }

    // 拖曳到購物籃
    const box = document.getElementById('box');
    box.addEventListener('dragover', e => e.preventDefault());
    box.addEventListener('drop', e => {
        e.preventDefault();
        const draggedItem = document.querySelector('.nut.dragging');
        if (draggedItem && boxItems.length < maxItems) {
            const index = draggedItem.getAttribute('data-index');
            const type = draggedItem.getAttribute('data-type');
            const value = parseInt(draggedItem.getAttribute('data-value'));
            draggedItem.style.display = 'none';
            draggedItem.setAttribute('draggable', 'false');

            const boxItem = document.createElement('img');
            boxItem.src = draggedItem.src;
            boxItem.className = 'box-nut';
            boxItem.setAttribute('data-index', index);
            boxItem.setAttribute('data-type', type);
            boxItem.setAttribute('data-value', value);
            boxItem.setAttribute('draggable', 'true');
            document.getElementById('box-nuts').appendChild(boxItem);

            boxItem.addEventListener('dragstart', () => {
                boxItem.classList.add('dragging');
                document.getElementById('guide-line').style.display = 'block';
                requestAnimationFrame(() => updateGuideLine({ clientX: boxItem.getBoundingClientRect().left, clientY: boxItem.getBoundingClientRect().top }, document.querySelector('.nut-area')));
            });

            boxItem.addEventListener('drag', (e) => {
                updateGuideLine(e, document.querySelector('.nut-area'));
            });

            boxItem.addEventListener('dragend', () => {
                boxItem.classList.remove('dragging');
                document.getElementById('guide-line').style.display = 'none';
            });

            boxItems.push({ type, value });
            updateCashRegister();
            updateMathQuestionDisplay();

            const item1Count = boxItems.filter(item => item.type === item1).length;
            const item2Count = boxItems.filter(item => item.type === item2).length;
            const item3Count = boxItems.filter(item => item.type === item3).length;

            if (item1Count === num1 && item2Count === 0 && item3Count === 0) {
                const num2Text = numberToText(num2, currentLanguage);
                const secondPrompt = langDict[currentLanguage].secondPrompt
                    .replace(/\{num2\}/g, num2Text)
                    .replace(/\{item2\}/g, itemNames[currentLanguage][item2]);
                speak(secondPrompt);
            } else if (item1Count === num1 && item2Count === num2 && item3Count === 0) {
                const num3Text = numberToText(num3, currentLanguage);
                const thirdPrompt = langDict[currentLanguage].thirdPrompt
                    .replace(/\{num3\}/g, num3Text)
                    .replace(/\{item3\}/g, itemNames[currentLanguage][item3]);
                speak(thirdPrompt);
            } else if (item1Count === num1 && item2Count === num2 && item3Count === num3) {
                speak(langDict[currentLanguage].totalPrompt);
            }

            document.getElementById('guide-line').style.display = 'none';
        }
    });

    // 拖曳到收銀員（金錢）
    const hamster = document.getElementById('hamster');
    hamster.addEventListener('dragover', e => e.preventDefault());
    hamster.addEventListener('drop', e => {
        e.preventDefault();
        if (!isAnswerCorrect) return;
        const draggedMoney = document.querySelector('.money.dragging');
        if (draggedMoney && paidMoney.length === 0) {
            const value = parseInt(draggedMoney.getAttribute('data-value'));
            if (value <= correctAnswer) return; // Only accept money greater than correctAnswer
            draggedMoney.style.display = 'none';
            draggedMoney.setAttribute('draggable', 'false');

            const hamsterMoney = document.createElement('img');
            hamsterMoney.src = draggedMoney.src;
            hamsterMoney.className = 'hamster-nut';
            hamsterMoney.setAttribute('data-value', value);
            hamsterMoney.setAttribute('draggable', 'true');
            document.getElementById('hamster-nuts').appendChild(hamsterMoney);

            hamsterMoney.addEventListener('dragstart', () => {
                hamsterMoney.classList.add('dragging');
                document.getElementById('guide-line').style.display = 'block';
                requestAnimationFrame(() => updateGuideLine({ clientX: hamsterMoney.getBoundingClientRect().left, clientY: hamsterMoney.getBoundingClientRect().top }, document.querySelector('.money-area')));
            });

            hamsterMoney.addEventListener('drag', (e) => {
                updateGuideLine(e, document.querySelector('.money-area'));
            });

            hamsterMoney.addEventListener('dragend', () => {
                hamsterMoney.classList.remove('dragging');
                document.getElementById('guide-line').style.display = 'none';
            });

            paidMoney.push({ value });
            changeAnswer = value - correctAnswer;
            document.querySelector('#box').style.display = 'none';
            document.querySelector('.change-area').style.display = 'flex';
            document.querySelector('.kid-area').style.display = 'block';
            updateCashCalculator();
            const changePrompt = langDict[currentLanguage].changePrompt;
            speak(changePrompt);
            document.getElementById('guide-line').style.display = 'none';
            console.log('Money dragged to hamster:', { value, changeAnswer });
        }
    });

    // 拖回物品區
    const nutArea = document.querySelector('.nut-area');
    nutArea.addEventListener('dragover', e => e.preventDefault());
    nutArea.addEventListener('drop', e => {
        e.preventDefault();
        const draggedItem = document.querySelector('.box-nut.dragging');
        if (draggedItem) {
            const index = draggedItem.getAttribute('data-index');
            const type = draggedItem.getAttribute('data-type');
            const originalItem = document.querySelector(`.nut[data-index="${index}"][data-type="${type}"]`);
            if (originalItem) {
                originalItem.style.display = 'block';
                originalItem.setAttribute('draggable', 'true');
                draggedItem.remove();
                boxItems = boxItems.filter(item => item.type !== type || item.value !== parseInt(draggedItem.getAttribute('data-value')));
                updateCashRegister();
                updateMathQuestionDisplay();
                document.querySelector('.change-area').style.display = 'none';
                document.querySelector('.kid-area').style.display = 'none';
                document.querySelector('#box').style.display = 'block';
                isAnswerCorrect = false;
                document.getElementById('guide-line').style.display = 'none';
                console.log('Item dragged back to nut-area:', boxItems);
            }
        }
    });

    // 拖回金錢區
    const moneyArea = document.querySelector('.money-area');
    moneyArea.addEventListener('dragover', e => e.preventDefault());
    moneyArea.addEventListener('drop', e => {
        e.preventDefault();
        const draggedMoney = document.querySelector('.hamster-nut.dragging');
        if (draggedMoney) {
            const value = parseInt(draggedMoney.getAttribute('data-value'));
            const originalMoney = document.querySelector(`.money[data-value="${value}"]`);
            if (originalMoney) {
                originalMoney.style.display = 'block';
                originalMoney.setAttribute('draggable', 'true');
                draggedMoney.remove();
                paidMoney = [];
                document.querySelector('.change-area').style.display = 'none';
                document.querySelector('.kid-area').style.display = 'none';
                document.querySelector('#box').style.display = 'block';
                updateCashCalculator();
                initializeDragListeners();
                showMoneyGuideLine();
                document.getElementById('guide-line').style.display = 'none';
                console.log('Money dragged back to money-area:', paidMoney);
            }
        }
    });

    // 檢查總金額答案
    function checkAnswer(number) {
        const feedback = document.getElementById('feedback');
        const audio = new Audio();
        totalQuestions++;
        const item1Count = boxItems.filter(item => item.type === item1).length;
        const item2Count = boxItems.filter(item => item.type === item2).length;
        const item3Count = boxItems.filter(item => item.type === item3).length;
        const totalValue = boxItems.reduce((sum, item) => sum + item.value, 0);

        console.log('Checking answer:', { number, correctAnswer, item1Count, num1, item2Count, num2, item3Count, num3, totalValue });

        if (number === correctAnswer && item1Count === num1 && item2Count === num2 && item3Count === num3 && totalValue === correctAnswer) {
            isAnswerCorrect = true;
            feedback.textContent = langDict[currentLanguage].correct;
            feedback.className = 'feedback correct';
            audio.src = 'assets/audio/suc.mp3';
            audio.play();
            document.querySelector('#box').style.display = 'none';
            document.querySelector('.money-area').style.display = 'flex';
            document.querySelector('.kid-area').style.display = 'none';
            console.log('Money Area Display:', document.querySelector('.money-area').style.display, document.querySelector('.money-area').getBoundingClientRect());
            speak(langDict[currentLanguage].moneyPrompt);
            document.getElementById('answer-box').textContent = '';
            selectedNumber = '';
            initializeDragListeners();
            showMoneyGuideLine();
            console.log('Correct total answer, proceeding to money phase');
        } else {
            feedback.textContent = langDict[currentLanguage].incorrect;
            feedback.className = 'feedback incorrect';
            audio.src = 'assets/audio/err.mp3';
            audio.play();
            speak(langDict[currentLanguage].tryAgain);
            console.log('Incorrect total answer');
        }

        feedback.style.display = 'block';
        setTimeout(() => {
            feedback.style.display = 'none';
        }, 2000);
        saveGameState();
    }

    // 檢查找零答案
    function checkChangeAnswer(number) {
        const feedback = document.getElementById('feedback');
        const audio = new Audio();
        totalQuestions++;

        console.log('Checking change answer:', { number, changeAnswer });

        if (number === changeAnswer) {
            correctQuestions++;
            feedback.textContent = langDict[currentLanguage].correct;
            feedback.className = 'feedback correct';
            audio.src = 'assets/audio/suc.mp3';
            audio.play();
            document.querySelector('.hamster-area').classList.add('bounce');
            setTimeout(() => {
                document.querySelector('.hamster-area').classList.remove('bounce');
                feedback.style.display = 'none';
                if (currentLevel < maxLevels) {
                    currentLevel++;
                    generateQuestion();
                } else {
                    document.getElementById('game-complete').style.display = 'block';
                    document.querySelector('.game-area').style.pointerEvents = 'none';
                }
            }, 2000);
            console.log('Correct change answer, advancing level:', currentLevel);
        } else {
            feedback.textContent = langDict[currentLanguage].incorrect;
            feedback.className = 'feedback incorrect';
            audio.src = 'assets/audio/err.mp3';
            audio.play();
            speak(langDict[currentLanguage].tryAgain);
            feedback.style.display = 'block';
            setTimeout(() => {
                feedback.style.display = 'none';
            }, 2000);
            console.log('Incorrect change answer');
        }

        saveGameState();
    }

    // 遊戲連結平滑滾動
    const gamesLink = document.querySelector('a[href="#games"]');
    if (gamesLink) {
        gamesLink.addEventListener('click', (event) => {
            event.preventDefault();
            const targetSection = document.querySelector('.game-container');
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // 初始化遊戲
    loadGameState();
    updateLanguage();
    initializeDragListeners();
    speak(langDict[currentLanguage].welcomePrompt);
    generateQuestion();
});
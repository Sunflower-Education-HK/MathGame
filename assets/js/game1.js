document.addEventListener('DOMContentLoaded', () => {
  let num1, num2, correctAnswer;
  let radishCount = 0;
  let selectedNumber = null;
  let currentLevel = 1;
  const maxLevels = 3;
  const maxRadishes = 10;

  // Update level display color
  function updateLevelDisplay() {
    const levelDisplay = document.getElementById('level-display');
    levelDisplay.className = `level-display level-${currentLevel}`;
    document.getElementById('level-counter').textContent = currentLevel;
  }

  // Generate new math question
  function generateQuestion() {
    do {
      num1 = Math.floor(Math.random() * 9) + 1; // 1-9
      num2 = Math.floor(Math.random() * 9) + 1; // 1-9
      correctAnswer = num1 + num2;
    } while (correctAnswer > 9); // Ensure answer <= 9

    document.getElementById('num1').textContent = num1;
    document.getElementById('num2').textContent = num2;
    document.getElementById('answer-box').textContent = '';
    document.getElementById('bucket-radishes').innerHTML = '';
    radishCount = 0;
    selectedNumber = null;

    // Reset radishes
    const radishes = document.querySelectorAll('.radish');
    radishes.forEach(radish => {
      radish.style.display = 'block';
      radish.setAttribute('draggable', 'true');
    });

    // Reset number grid
    const numberCells = document.querySelectorAll('.number-cell');
    numberCells.forEach(cell => {
      cell.setAttribute('draggable', 'true');
    });

    document.getElementById('feedback').style.display = 'none';
    document.getElementById('game-complete').style.display = 'none';
    updateLevelDisplay();
  }

  // Initialize drag and drop for radishes
  const radishes = document.querySelectorAll('.radish');
  const bucket = document.getElementById('bucket');
  const radishArea = document.querySelector('.radish-area');

  radishes.forEach(radish => {
    radish.addEventListener('dragstart', () => {
      radish.classList.add('dragging');
    });

    radish.addEventListener('dragend', () => {
      radish.classList.remove('dragging');
    });
  });

  bucket.addEventListener('dragover', e => {
    e.preventDefault();
  });

  bucket.addEventListener('drop', e => {
    e.preventDefault();
    const draggedRadish = document.querySelector('.radish.dragging');
    if (draggedRadish && radishCount < maxRadishes) {
      const index = draggedRadish.getAttribute('data-index');
      draggedRadish.style.display = 'none';
      draggedRadish.setAttribute('draggable', 'false');
      radishCount++;

      // Add radish to bucket
      const bucketRadish = document.createElement('img');
      bucketRadish.src = 'assets/images/radishes.png';
      bucketRadish.className = 'bucket-radish';
      bucketRadish.setAttribute('data-index', index);
      bucketRadish.setAttribute('draggable', 'true');
      document.getElementById('bucket-radishes').appendChild(bucketRadish);

      // Enable drag back
      bucketRadish.addEventListener('dragstart', () => {
        bucketRadish.classList.add('dragging');
      });

      bucketRadish.addEventListener('dragend', () => {
        bucketRadish.classList.remove('dragging');
      });
    }
  });

  // Drag back to radish area
  radishArea.addEventListener('dragover', e => {
    e.preventDefault();
  });

  radishArea.addEventListener('drop', e => {
    e.preventDefault();
    const draggedRadish = document.querySelector('.bucket-radish.dragging');
    if (draggedRadish) {
      const index = draggedRadish.getAttribute('data-index');
      const originalRadish = document.querySelector(`.radish[data-index="${index}"]`);
      originalRadish.style.display = 'block';
      originalRadish.setAttribute('draggable', 'true');
      draggedRadish.remove();
      radishCount--;
    }
  });

  // Initialize drag and drop for numbers
  const numberCells = document.querySelectorAll('.number-cell');
  const answerBox = document.getElementById('answer-box');

  numberCells.forEach(cell => {
    cell.addEventListener('dragstart', () => {
      cell.classList.add('dragging');
    });

    cell.addEventListener('dragend', () => {
      cell.classList.remove('dragging');
    });
  });

  answerBox.addEventListener('dragover', e => {
    e.preventDefault();
  });

  answerBox.addEventListener('drop', e => {
    e.preventDefault();
    const draggedCell = document.querySelector('.number-cell.dragging');
    if (draggedCell) {
      selectedNumber = parseInt(draggedCell.getAttribute('data-number'));
      answerBox.textContent = selectedNumber;
    }
  });

  // Confirm button click
  document.getElementById('confirm-button').addEventListener('click', () => {
    if (selectedNumber !== null) {
      checkAnswer(selectedNumber);
    } else {
      const feedback = document.getElementById('feedback');
      feedback.textContent = '請選擇一個數字！';
      feedback.className = 'feedback incorrect';
      feedback.style.display = 'block';
      setTimeout(() => {
        feedback.style.display = 'none';
      }, 2000);
    }
  });

  // Check if the answer is correct
  function checkAnswer(number) {
    const feedback = document.getElementById('feedback');
    const audio = new Audio();

    if (number === correctAnswer && radishCount === correctAnswer) {
      feedback.textContent = '答對了！';
      feedback.className = 'feedback correct';
      audio.src = 'assets/audio/suc.mp3';
      audio.play();

      // Check if game is complete
      if (currentLevel < maxLevels) {
        currentLevel++;
        setTimeout(generateQuestion, 2000); // Next level
      } else {
        setTimeout(() => {
          document.getElementById('game-complete').style.display = 'block';
          document.querySelector('.game-area').style.pointerEvents = 'none'; // Disable interactions
        }, 2000);
      }
    } else {
      feedback.textContent = '答錯了！';
      feedback.className = 'feedback incorrect';
      audio.src = 'assets/audio/err.mp3';
      audio.play();
      setTimeout(() => {
        feedback.style.display = 'none';
      }, 2000);
    }
  }

  // Start the game
  generateQuestion();
});
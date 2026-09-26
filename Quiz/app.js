let questions = [];
let scores = {
    tush: 0,
    font: 0
};

let currentQuestion = null;

const gameBoard = document.getElementById("game-board");
const modal = document.getElementById("question-modal");

const questionCategory = document.getElementById("question-category");
const questionPoints = document.getElementById("question-points");
const questionText = document.getElementById("question-text");

const answerBlock = document.getElementById("answer");
const answerText = document.getElementById("answer-text");

const showAnswerButton = document.getElementById("show-answer");

const correctTushButton = document.getElementById("correct-tush");
const correctFontButton = document.getElementById("correct-font");
const wrongButton = document.getElementById("wrong-answer");

const closeButton = document.getElementById("close-modal");

const scoreTush = document.getElementById("score-tush");
const scoreFont = document.getElementById("score-font");


// ==============================
// Загрузка вопросов
// ==============================

async function loadQuestions() {
    try {
        const response = await fetch(`data/questions.json?v=${Date.now()}`);

        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.status}`);
        }

        const data = await response.json();

        // Наш JSON имеет структуру:
        // {
        //     "categories": [...]
        // }

        if (!data.categories || !Array.isArray(data.categories)) {
            throw new Error("В JSON отсутствует массив categories");
        }

        questions = data.categories;

        console.log("Вопросы загружены:", questions);
        console.log("Количество категорий:", questions.length);

        createGameBoard();

    } catch (error) {
        console.error("Ошибка загрузки вопросов:", error);

        gameBoard.innerHTML = `
            <div class="load-error">
                <h2>Не удалось загрузить вопросы</h2>
                <p>${error.message}</p>
            </div>
        `;
    }
}


// ==============================
// Создание игрового поля
// ==============================

function createGameBoard() {

    gameBoard.innerHTML = "";

    questions.forEach((category) => {

        const categoryColumn = document.createElement("div");
        categoryColumn.className = "category-column";

        // Название категории
        const categoryHeader = document.createElement("div");
        categoryHeader.className = "category-header";
        categoryHeader.textContent = category.name;

        categoryColumn.appendChild(categoryHeader);


        // Вопросы
        category.questions.forEach((question) => {

            const questionButton = document.createElement("button");

            questionButton.className = "question-button";
            questionButton.type = "button";
            questionButton.textContent = question.points;

            questionButton.addEventListener("click", () => {
                openQuestion(
                    category,
                    question,
                    questionButton
                );
            });

            categoryColumn.appendChild(questionButton);
        });

        gameBoard.appendChild(categoryColumn);
    });
}


// ==============================
// Открытие вопроса
// ==============================

function openQuestion(category, question, button) {

    currentQuestion = {
        category,
        question,
        button
    };

    questionCategory.textContent = category.name;
    questionPoints.textContent = question.points;
    questionText.textContent = question.question;

    answerText.textContent = question.answer;

    // Скрываем ответ
    answerBlock.classList.add("hidden");

    // Показываем кнопку "Показать ответ"
    showAnswerButton.classList.remove("hidden");

    // Скрываем кнопки команд
    correctTushButton.classList.add("hidden");
    correctFontButton.classList.add("hidden");
    wrongButton.classList.add("hidden");

    // Открываем модальное окно
    modal.classList.remove("hidden");
}


// ==============================
// Показать ответ
// ==============================

showAnswerButton.addEventListener("click", () => {

    answerBlock.classList.remove("hidden");

    showAnswerButton.classList.add("hidden");

    correctTushButton.classList.remove("hidden");
    correctFontButton.classList.remove("hidden");
    wrongButton.classList.remove("hidden");
});


// ==============================
// ТУШЬ ответила правильно
// ==============================

correctTushButton.addEventListener("click", () => {

    if (!currentQuestion) return;

    scores.tush += Number(currentQuestion.question.points);

    updateScores();

    finishQuestion();
});


// ==============================
// ШРИФТ ответила правильно
// ==============================

correctFontButton.addEventListener("click", () => {

    if (!currentQuestion) return;

    scores.font += Number(currentQuestion.question.points);

    updateScores();

    finishQuestion();
});


// ==============================
// Неправильный ответ
// ==============================

wrongButton.addEventListener("click", () => {

    if (!currentQuestion) return;

    finishQuestion();
});


// ==============================
// Завершение вопроса
// ==============================

function finishQuestion() {

    if (currentQuestion && currentQuestion.button) {

        currentQuestion.button.classList.add("used");
        currentQuestion.button.disabled = true;
    }

    closeModal();
}


// ==============================
// Обновление счета
// ==============================

function updateScores() {

    scoreTush.textContent = scores.tush;
    scoreFont.textContent = scores.font;
}


// ==============================
// Закрытие окна
// ==============================

function closeModal() {

    modal.classList.add("hidden");

    currentQuestion = null;

    answerBlock.classList.add("hidden");

    showAnswerButton.classList.remove("hidden");

    correctTushButton.classList.add("hidden");
    correctFontButton.classList.add("hidden");
    wrongButton.classList.add("hidden");
}


// ==============================
// Кнопка "Закрыть"
// ==============================

closeButton.addEventListener("click", () => {
    closeModal();
});


// ==============================
// ESC
// ==============================

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
        closeModal();
    }

});


// ==============================
// Запуск
// ==============================

loadQuestions();

let questions = [];

let scores = {
    tush: 0,
    font: 0
};

let currentQuestion = null;
let usedQuestions = 0;


// ==========================================
// ЭЛЕМЕНТЫ СТРАНИЦЫ
// ==========================================

const gameBoard = document.getElementById("game-board");
const modal = document.getElementById("question-modal");

const questionCategory = document.getElementById("question-category");
const questionPoints = document.getElementById("question-points");
const questionText = document.getElementById("question-text");

const answer = document.getElementById("answer");
const answerText = document.getElementById("answer-text");

const showAnswerButton =
    document.getElementById("show-answer");

const correctTushButton =
    document.getElementById("correct-tush");

const correctFontButton =
    document.getElementById("correct-font");

const wrongButton =
    document.getElementById("wrong-answer");

const closeButton =
    document.getElementById("close-modal");

const scoreTush =
    document.getElementById("score-tush");

const scoreFont =
    document.getElementById("score-font");

const teamNameTush =
    document.getElementById("team-name-tush");

const teamNameFont =
    document.getElementById("team-name-font");

const correctTushName =
    document.getElementById("correct-tush-name");

const correctFontName =
    document.getElementById("correct-font-name");

const newGameButton =
    document.getElementById("new-game");

const surrenderButton =
    document.getElementById("surrender-game");

const restartGameButton =
    document.getElementById("restart-game");

const questionsLeft =
    document.getElementById("questions-left");

const roundNumber =
    document.getElementById("round-number");


// ==========================================
// ИЗОБРАЖЕНИЕ ВОПРОСА
// ==========================================

const questionImage =
    document.createElement("img");

questionImage.className =
    "question-image";

questionImage.alt =
    "Изображение к вопросу";

questionImage.style.display =
    "none";


// ВАЖНО:
// картинка вставляется внутрь .question-body
// перед заголовком вопроса.

questionText.parentNode.insertBefore(
    questionImage,
    questionText
);


// ==========================================
// ВАРИАНТЫ ОТВЕТА
// ==========================================

const optionsContainer =
    document.createElement("div");

optionsContainer.className =
    "question-options";

optionsContainer.style.display =
    "none";


// Вставляем варианты ПОСЛЕ текста вопроса.
// Здесь insertBefore используется правильно:
// оба элемента находятся внутри .question-body.

questionText.parentNode.insertBefore(
    optionsContainer,
    questionText.nextSibling
);


// ==========================================
// ЗАГРУЗКА ВОПРОСОВ
// ==========================================

async function loadQuestions() {

    try {

        const response = await fetch(
            `data/questions.json?v=${Date.now()}`
        );

        if (!response.ok) {

            throw new Error(
                `Не удалось загрузить questions.json: ${response.status}`
            );

        }


        const data =
            await response.json();


        if (
            !data.categories ||
            !Array.isArray(data.categories)
        ) {

            throw new Error(
                "В questions.json отсутствует массив categories"
            );

        }


        questions =
            data.categories;


        console.log(
            "Вопросы загружены:",
            questions
        );


        createGameBoard();

        updateQuestionsLeft();

        updateTeamNames();

    }

    catch (error) {

        console.error(
            "Ошибка загрузки вопросов:",
            error
        );


        gameBoard.innerHTML = `

            <div class="load-error">

                <h2>
                    Не удалось загрузить вопросы
                </h2>

                <p>
                    ${error.message}
                </p>

                <p>
                    Проверь файл
                    <strong>
                        data/questions.json
                    </strong>
                </p>

            </div>

        `;

    }

}


// ==========================================
// СОЗДАНИЕ ИГРОВОГО ПОЛЯ
// ==========================================

function createGameBoard() {

    gameBoard.innerHTML = "";


    questions.forEach((category) => {

        const categoryColumn =
            document.createElement("div");

        categoryColumn.className =
            "category-column";


        // Название категории

        const categoryHeader =
            document.createElement("div");

        categoryHeader.className =
            "category-header";

        categoryHeader.textContent =
            category.name;


        categoryColumn.appendChild(
            categoryHeader
        );


        // Вопросы

        if (
            !category.questions ||
            !Array.isArray(category.questions)
        ) {

            console.warn(
                `У категории "${category.name}" нет вопросов`
            );

            return;

        }


        category.questions.forEach(
            (question) => {

                const questionButton =
                    document.createElement("button");

                questionButton.className =
                    "question-button";

                questionButton.type =
                    "button";

                questionButton.textContent =
                    question.points;


                questionButton.addEventListener(
                    "click",
                    () => {

                        openQuestion(
                            category,
                            question,
                            questionButton
                        );

                    }
                );


                categoryColumn.appendChild(
                    questionButton
                );

            }
        );


        gameBoard.appendChild(
            categoryColumn
        );

    });

}


// ==========================================
// ОТКРЫТИЕ ВОПРОСА
// ==========================================

function openQuestion(
    category,
    question,
    button
) {

    currentQuestion = {
        category: category,
        question: question,
        button: button
    };


    // Категория

    questionCategory.textContent =
        category.name;


    // Стоимость

    questionPoints.textContent =
        question.points;


    // Вопрос

    questionText.textContent =
        question.question;


    // ======================================
    // ИЗОБРАЖЕНИЕ
    // ======================================

    if (question.image) {

        questionImage.src =
            question.image;

        questionImage.style.display =
            "block";

    }
    else {

        questionImage.style.display =
            "none";

        questionImage.removeAttribute(
            "src"
        );

    }


    // ======================================
    // ВАРИАНТЫ ОТВЕТА
    // ======================================

    optionsContainer.innerHTML = "";


    if (
        question.options &&
        Array.isArray(question.options) &&
        question.options.length > 0
    ) {

        optionsContainer.style.display =
            "flex";


        question.options.forEach(
            (option, index) => {

                const optionElement =
                    document.createElement("div");

                optionElement.className =
                    "question-option";


                const letter =
                    String.fromCharCode(
                        65 + index
                    );


                optionElement.innerHTML = `

                    <span class="option-letter">
                        ${letter}
                    </span>

                    <span class="option-text">
                        ${option}
                    </span>

                `;


                optionsContainer.appendChild(
                    optionElement
                );

            }
        );

    }
    else {

        optionsContainer.style.display =
            "none";

    }


    // ======================================
    // ОТВЕТ
    // ======================================

    answerText.textContent =
        question.answer;


    answer.classList.add(
        "hidden"
    );


    // ======================================
    // КНОПКИ
    // ======================================

    showAnswerButton.classList.remove(
        "hidden"
    );

    correctTushButton.classList.add(
        "hidden"
    );

    correctFontButton.classList.add(
        "hidden"
    );

    wrongButton.classList.add(
        "hidden"
    );


    // ======================================
    // ОТКРЫВАЕМ МОДАЛЬНОЕ ОКНО
    // ======================================

    modal.classList.remove(
        "hidden"
    );

}


// ==========================================
// ПОКАЗАТЬ ОТВЕТ
// ==========================================

showAnswerButton.addEventListener(
    "click",
    () => {

        if (!currentQuestion) {
            return;
        }


        answer.classList.remove(
            "hidden"
        );


        showAnswerButton.classList.add(
            "hidden"
        );


        correctTushButton.classList.remove(
            "hidden"
        );

        correctFontButton.classList.remove(
            "hidden"
        );

        wrongButton.classList.remove(
            "hidden"
        );

    }
);


// ==========================================
// КОМАНДА 1 ОТВЕТИЛА ПРАВИЛЬНО
// ==========================================

correctTushButton.addEventListener(
    "click",
    () => {

        if (!currentQuestion) {
            return;
        }


        scores.tush += Number(
            currentQuestion.question.points
        );


        updateScores();

        finishQuestion();

    }
);


// ==========================================
// КОМАНДА 2 ОТВЕТИЛА ПРАВИЛЬНО
// ==========================================

correctFontButton.addEventListener(
    "click",
    () => {

        if (!currentQuestion) {
            return;
        }


        scores.font += Number(
            currentQuestion.question.points
        );


        updateScores();

        finishQuestion();

    }
);


// ==========================================
// НЕПРАВИЛЬНЫЙ ОТВЕТ
// ==========================================

wrongButton.addEventListener(
    "click",
    () => {

        if (!currentQuestion) {
            return;
        }


        finishQuestion();

    }
);


// ==========================================
// ЗАВЕРШЕНИЕ ВОПРОСА
// ==========================================

function finishQuestion() {

    if (
        currentQuestion &&
        currentQuestion.button
    ) {

        currentQuestion.button.classList.add(
            "used"
        );

        currentQuestion.button.disabled =
            true;


        usedQuestions++;

        updateQuestionsLeft();

        updateRoundNumber();

    }


    closeModal();

}


// ==========================================
// ОБНОВЛЕНИЕ СЧЁТА
// ==========================================

function updateScores() {

    scoreTush.textContent =
        scores.tush;

    scoreFont.textContent =
        scores.font;

}


// ==========================================
// НАЗВАНИЯ КОМАНД
// ==========================================

function updateTeamNames() {

    correctTushName.textContent =
        teamNameTush.value ||
        "Команда 1";

    correctFontName.textContent =
        teamNameFont.value ||
        "Команда 2";

}


// Если пользователь меняет название команды,
// сразу меняем название на кнопке ответа.

teamNameTush.addEventListener(
    "input",
    () => {

        correctTushName.textContent =
            teamNameTush.value ||
            "Команда 1";

    }
);


teamNameFont.addEventListener(
    "input",
    () => {

        correctFontName.textContent =
            teamNameFont.value ||
            "Команда 2";

    }
);


// ==========================================
// СЧЁТЧИК ВОПРОСОВ
// ==========================================

function getTotalQuestions() {

    let total = 0;


    questions.forEach(
        (category) => {

            if (
                category.questions &&
                Array.isArray(category.questions)
            ) {

                total +=
                    category.questions.length;

            }

        }
    );


    return total;

}


function updateQuestionsLeft() {

    const total =
        getTotalQuestions();

    const left =
        total - usedQuestions;


    questionsLeft.textContent =
        `${left} вопросов осталось`;

}


// ==========================================
// НОМЕР РАУНДА
// ==========================================

function updateRoundNumber() {

    const round =
        usedQuestions
            .toString()
            .padStart(2, "0");


    roundNumber.textContent =
        `ROUND ${round}`;

}


// ==========================================
// ЗАКРЫТИЕ ВОПРОСА
// ==========================================

function closeModal() {

    modal.classList.add(
        "hidden"
    );


    currentQuestion = null;


    // Ответ

    answer.classList.add(
        "hidden"
    );


    // Картинка

    questionImage.style.display =
        "none";

    questionImage.removeAttribute(
        "src"
    );


    // Варианты

    optionsContainer.style.display =
        "none";

    optionsContainer.innerHTML =
        "";


    // Кнопки

    showAnswerButton.classList.remove(
        "hidden"
    );

    correctTushButton.classList.add(
        "hidden"
    );

    correctFontButton.classList.add(
        "hidden"
    );

    wrongButton.classList.add(
        "hidden"
    );

}


// ==========================================
// КНОПКА "ЗАКРЫТЬ"
// ==========================================

closeButton.addEventListener(
    "click",
    () => {

        closeModal();

    }
);


// ==========================================
// ESC
// ==========================================

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            closeModal();

        }

    }
);


// ==========================================
// НОВАЯ ИГРА
// ==========================================

function startNewGame() {

    scores = {
        tush: 0,
        font: 0
    };


    usedQuestions = 0;


    updateScores();

    updateQuestionsLeft();

    updateRoundNumber();


    // Сбрасываем все клетки

    const buttons =
        document.querySelectorAll(
            ".question-button"
        );


    buttons.forEach(
        (button) => {

            button.disabled =
                false;

            button.classList.remove(
                "used"
            );

        }
    );


    closeModal();

}


newGameButton.addEventListener(
    "click",
    () => {

        startNewGame();

    }
);


// ==========================================
// СДАТЬСЯ
// ==========================================

surrenderButton.addEventListener(
    "click",
    () => {

        showGameOver();

    }
);


// ==========================================
// ОКОНЧАНИЕ ИГРЫ
// ==========================================

function showGameOver() {

    const gameOverModal =
        document.getElementById(
            "game-over-modal"
        );

    const winnerTitle =
        document.getElementById(
            "winner-title"
        );

    const finalTeamNameTush =
        document.getElementById(
            "final-team-name-tush"
        );

    const finalTeamNameFont =
        document.getElementById(
            "final-team-name-font"
        );

    const finalScoreTush =
        document.getElementById(
            "final-score-tush"
        );

    const finalScoreFont =
        document.getElementById(
            "final-score-font"
        );


    finalTeamNameTush.textContent =
        teamNameTush.value ||
        "Команда 1";

    finalTeamNameFont.textContent =
        teamNameFont.value ||
        "Команда 2";


    finalScoreTush.textContent =
        scores.tush;

    finalScoreFont.textContent =
        scores.font;


    if (scores.tush > scores.font) {

        winnerTitle.textContent =
            `${teamNameTush.value || "Команда 1"} победила!`;

    }
    else if (scores.font > scores.tush) {

        winnerTitle.textContent =
            `${teamNameFont.value || "Команда 2"} победила!`;

    }
    else {

        winnerTitle.textContent =
            "Ничья!";

    }


    gameOverModal.classList.remove(
        "hidden"
    );

}


// ==========================================
// КНОПКА "НОВАЯ ИГРА"
// В ОКНЕ ОКОНЧАНИЯ
// ==========================================

restartGameButton.addEventListener(
    "click",
    () => {

        const gameOverModal =
            document.getElementById(
                "game-over-modal"
            );


        gameOverModal.classList.add(
            "hidden"
        );


        startNewGame();

    }
);


// ==========================================
// ЗАПУСК
// ==========================================

loadQuestions();

let questions = [];

let scores = {
    tush: 0,
    font: 0
};

let teamNames = {
    tush: "ТУШЬ",
    font: "ШРИФТ"
};

let usedQuestions = new Set();

let currentQuestion = null;

let roundNumber = 0;

let gameFinished = false;

const STORAGE_KEY = "quiz-night-game-v2";


// ==============================
// ELEMENTS
// ==============================

const gameBoard =
    document.getElementById("game-board");

const modal =
    document.getElementById("question-modal");

const gameOverModal =
    document.getElementById("game-over-modal");


const questionCategory =
    document.getElementById("question-category");

const questionPoints =
    document.getElementById("question-points");

const questionText =
    document.getElementById("question-text");


const answerBlock =
    document.getElementById("answer");

const answerText =
    document.getElementById("answer-text");


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


const finalTeamNameTush =
    document.getElementById("final-team-name-tush");

const finalTeamNameFont =
    document.getElementById("final-team-name-font");


const newGameButton =
    document.getElementById("new-game");

const surrenderButton =
    document.getElementById("surrender-game");

const restartGameButton =
    document.getElementById("restart-game");


const questionsLeft =
    document.getElementById("questions-left");

const roundNumberElement =
    document.getElementById("round-number");


const winnerTitle =
    document.getElementById("winner-title");

const gameOverLabel =
    document.getElementById("game-over-label");


const finalScoreTush =
    document.getElementById("final-score-tush");

const finalScoreFont =
    document.getElementById("final-score-font");


// ==============================
// LOAD QUESTIONS
// ==============================

async function loadQuestions() {

    try {

        const response = await fetch(
            `data/questions.json?v=${Date.now()}`
        );

        if (!response.ok) {
            throw new Error(
                `Ошибка загрузки questions.json: ${response.status}`
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

        validateQuestions();

        loadGameState();

        createGameBoard();

        updateAllUI();

        console.log(
            "Вопросы загружены:",
            questions
        );

    } catch (error) {

        console.error(
            "Ошибка загрузки вопросов:",
            error
        );

        gameBoard.innerHTML = `
            <div class="load-error">
                <h2>Не удалось загрузить вопросы</h2>
                <p>${escapeHtml(error.message)}</p>
                <p>Проверь файл data/questions.json</p>
            </div>
        `;
    }
}


// ==============================
// VALIDATE QUESTIONS
// ==============================

function validateQuestions() {

    questions.forEach(
        (category, categoryIndex) => {

            if (!category.name) {
                throw new Error(
                    `Категория ${categoryIndex + 1} не имеет имени`
                );
            }

            if (!Array.isArray(category.questions)) {
                throw new Error(
                    `У категории "${category.name}" отсутствует массив questions`
                );
            }

            category.questions.forEach(
                (question, questionIndex) => {

                    if (
                        typeof question.points === "undefined" ||
                        !question.question ||
                        typeof question.answer === "undefined"
                    ) {

                        throw new Error(
                            `Некорректный вопрос: ${category.name} / ${questionIndex + 1}`
                        );
                    }
                }
            );
        }
    );
}


// ==============================
// CREATE BOARD
// ==============================

function createGameBoard() {

    gameBoard.innerHTML = "";

    questions.forEach(
        (category, categoryIndex) => {

            const categoryColumn =
                document.createElement("div");

            categoryColumn.className =
                "category-column";


            const categoryHeader =
                document.createElement("div");

            categoryHeader.className =
                "category-header";

            categoryHeader.textContent =
                category.name;


            categoryColumn.appendChild(
                categoryHeader
            );


            category.questions.forEach(
                (question, questionIndex) => {

                    const questionButton =
                        document.createElement("button");

                    questionButton.className =
                        "question-button";

                    questionButton.type =
                        "button";

                    questionButton.textContent =
                        question.points;


                    const questionId =
                        createQuestionId(
                            categoryIndex,
                            questionIndex
                        );


                    questionButton.dataset.questionId =
                        questionId;


                    if (
                        usedQuestions.has(
                            questionId
                        )
                    ) {

                        markQuestionUsed(
                            questionButton
                        );
                    }


                    questionButton.addEventListener(
                        "click",
                        () => {

                            openQuestion(
                                category,
                                question,
                                questionButton,
                                questionId
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
        }
    );
}


// ==============================
// QUESTION ID
// ==============================

function createQuestionId(
    categoryIndex,
    questionIndex
) {

    return `${categoryIndex}-${questionIndex}`;
}


// ==============================
// OPEN QUESTION
// ==============================

function openQuestion(
    category,
    question,
    button,
    questionId
) {

    if (
        button.disabled ||
        usedQuestions.has(questionId) ||
        gameFinished
    ) {
        return;
    }


    currentQuestion = {
        category,
        question,
        button,
        questionId
    };


    // Каждый новый открытый вопрос = новый раунд
    roundNumber++;

    updateRound();

    saveGameState();


    questionCategory.textContent =
        category.name;

    questionPoints.textContent =
        question.points;

    questionText.textContent =
        question.question;

    answerText.textContent =
        question.answer;


    answerBlock.classList.add(
        "hidden"
    );


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


    modal.classList.remove(
        "hidden"
    );
}


// ==============================
// SHOW ANSWER
// ==============================

showAnswerButton.addEventListener(
    "click",
    () => {

        answerBlock.classList.remove(
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


// ==============================
// TUSH CORRECT
// ==============================

correctTushButton.addEventListener(
    "click",
    () => {

        if (!currentQuestion) {
            return;
        }

        scores.tush += Number(
            currentQuestion.question.points
        );

        finishQuestion();
    }
);


// ==============================
// FONT CORRECT
// ==============================

correctFontButton.addEventListener(
    "click",
    () => {

        if (!currentQuestion) {
            return;
        }

        scores.font += Number(
            currentQuestion.question.points
        );

        finishQuestion();
    }
);


// ==============================
// WRONG ANSWER
// ==============================

wrongButton.addEventListener(
    "click",
    () => {

        if (!currentQuestion) {
            return;
        }

        finishQuestion();
    }
);


// ==============================
// FINISH QUESTION
// ==============================

function finishQuestion() {

    if (!currentQuestion) {
        return;
    }


    usedQuestions.add(
        currentQuestion.questionId
    );


    markQuestionUsed(
        currentQuestion.button
    );


    closeModal();

    saveGameState();

    updateAllUI();


    if (
        usedQuestions.size >=
        getTotalQuestions()
    ) {

        setTimeout(
            () => finishGame(false),
            250
        );
    }
}


// ==============================
// MARK USED
// ==============================

function markQuestionUsed(button) {

    button.classList.add("used");

    button.disabled = true;
}


// ==============================
// UPDATE UI
// ==============================

function updateAllUI() {

    updateScores();

    updateRound();

    updateQuestionsLeft();

    updateTeamNames();

    updateTeamButtons();
}


// ==============================
// SCORE
// ==============================

function updateScores() {

    scoreTush.textContent =
        formatNumber(scores.tush);

    scoreFont.textContent =
        formatNumber(scores.font);
}


// ==============================
// ROUND
// ==============================

function updateRound() {

    roundNumberElement.textContent =
        `ROUND ${String(roundNumber).padStart(2, "0")}`;
}


// ==============================
// QUESTIONS LEFT
// ==============================

function updateQuestionsLeft() {

    const total =
        getTotalQuestions();

    const left =
        total - usedQuestions.size;


    if (left === 0) {

        questionsLeft.textContent =
            "Все вопросы сыграны";

        return;
    }


    questionsLeft.textContent =
        `${left} ${getQuestionWord(left)} осталось`;
}


// ==============================
// TEAM NAMES
// ==============================

function updateTeamNames() {

    teamNameTush.value =
        teamNames.tush;

    teamNameFont.value =
        teamNames.font;


    correctTushName.textContent =
        teamNames.tush;

    correctFontName.textContent =
        teamNames.font;


    finalTeamNameTush.textContent =
        teamNames.tush;

    finalTeamNameFont.textContent =
        teamNames.font;
}


function updateTeamButtons() {

    correctTushButton.title =
        `Правильный ответ команды ${teamNames.tush}`;

    correctFontButton.title =
        `Правильный ответ команды ${teamNames.font}`;
}


// ==============================
// TEAM NAME INPUTS
// ==============================

function setupTeamNameInput(
    input,
    teamKey
) {

    input.addEventListener(
        "change",
        () => {

            let name =
                input.value.trim();

            if (!name) {
                name =
                    teamKey === "tush"
                        ? "ТУШЬ"
                        : "ШРИФТ";
            }


            teamNames[teamKey] =
                name;


            updateTeamNames();

            updateTeamButtons();

            saveGameState();
        }
    );


    input.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {
                input.blur();
            }
        }
    );
}


setupTeamNameInput(
    teamNameTush,
    "tush"
);


setupTeamNameInput(
    teamNameFont,
    "font"
);


// ==============================
// GET TOTAL QUESTIONS
// ==============================

function getTotalQuestions() {

    return questions.reduce(
        (total, category) => {

            return total +
                category.questions.length;

        },
        0
    );
}


// ==============================
// WORD
// ==============================

function getQuestionWord(number) {

    const mod10 =
        number % 10;

    const mod100 =
        number % 100;


    if (
        mod10 === 1 &&
        mod100 !== 11
    ) {
        return "вопрос";
    }


    if (
        mod10 >= 2 &&
        mod10 <= 4 &&
        (
            mod100 < 10 ||
            mod100 >= 20
        )
    ) {
        return "вопроса";
    }


    return "вопросов";
}


// ==============================
// CLOSE QUESTION
// ==============================

function closeModal() {

    modal.classList.add(
        "hidden"
    );

    currentQuestion = null;

    answerBlock.classList.add(
        "hidden"
    );

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


// ==============================
// SURRENDER
// ==============================

surrenderButton.addEventListener(
    "click",
    () => {

        if (gameFinished) {
            return;
        }


        const confirmed =
            window.confirm(
                "Точно закончить игру досрочно?"
            );


        if (!confirmed) {
            return;
        }


        if (!modal.classList.contains("hidden")) {
            closeModal();
        }


        finishGame(true);
    }
);


// ==============================
// FINISH GAME
// ==============================

function finishGame(
    surrendered = false
) {

    gameFinished = true;

    closeModal();


    gameOverLabel.textContent =
        surrendered
            ? "ИГРА ЗАВЕРШЕНА ДОСРОЧНО"
            : "ИГРА ЗАВЕРШЕНА";


    if (scores.tush > scores.font) {

        winnerTitle.textContent =
            `${teamNames.tush} побеждает`;

    } else if (
        scores.font > scores.tush
    ) {

        winnerTitle.textContent =
            `${teamNames.font} побеждает`;

    } else {

        winnerTitle.textContent =
            "Ничья";
    }


    finalScoreTush.textContent =
        formatNumber(scores.tush);

    finalScoreFont.textContent =
        formatNumber(scores.font);


    finalTeamNameTush.textContent =
        teamNames.tush;

    finalTeamNameFont.textContent =
        teamNames.font;


    gameOverModal.classList.remove(
        "hidden"
    );


    saveGameState();
}


// ==============================
// NEW GAME
// ==============================

function startNewGame() {

    const confirmed =
        window.confirm(
            "Начать новую игру?\n\nСчёт, раунд и использованные вопросы будут сброшены."
        );


    if (!confirmed) {
        return;
    }


    scores = {
        tush: 0,
        font: 0
    };


    teamNames = {
        tush: "ТУШЬ",
        font: "ШРИФТ"
    };


    usedQuestions =
        new Set();


    roundNumber = 0;

    gameFinished = false;

    currentQuestion = null;


    gameOverModal.classList.add(
        "hidden"
    );


    modal.classList.add(
        "hidden"
    );


    createGameBoard();

    updateAllUI();

    saveGameState();
}


// ==============================
// BUTTONS
// ==============================

newGameButton.addEventListener(
    "click",
    startNewGame
);


restartGameButton.addEventListener(
    "click",
    startNewGame
);


closeButton.addEventListener(
    "click",
    closeModal
);


// ==============================
// ESC
// ==============================

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key !== "Escape") {
            return;
        }


        if (
            !modal.classList.contains(
                "hidden"
            )
        ) {

            closeModal();

        } else if (
            !gameOverModal.classList.contains(
                "hidden"
            )
        ) {

            gameOverModal.classList.add(
                "hidden"
            );
        }
    }
);


// ==============================
// SAVE GAME
// ==============================

function saveGameState() {

    const state = {

        scores,

        teamNames,

        roundNumber,

        gameFinished,

        usedQuestions:
            Array.from(
                usedQuestions
            )
    };


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );
}


// ==============================
// LOAD GAME
// ==============================

function loadGameState() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!saved) {
            return;
        }


        const state =
            JSON.parse(saved);


        if (state.scores) {

            scores.tush =
                Number(
                    state.scores.tush
                ) || 0;

            scores.font =
                Number(
                    state.scores.font
                ) || 0;
        }


        if (state.teamNames) {

            if (
                state.teamNames.tush
            ) {
                teamNames.tush =
                    state.teamNames.tush;
            }

            if (
                state.teamNames.font
            ) {
                teamNames.font =
                    state.teamNames.font;
            }
        }


        if (
            typeof state.roundNumber ===
            "number"
        ) {

            roundNumber =
                state.roundNumber;
        }


        gameFinished =
            Boolean(
                state.gameFinished
            );


        if (
            Array.isArray(
                state.usedQuestions
            )
        ) {

            usedQuestions =
                new Set(
                    state.usedQuestions
                );
        }


        if (gameFinished) {

            setTimeout(
                () => finishGame(
                    usedQuestions.size <
                    getTotalQuestions()
                ),
                0
            );
        }


    } catch (error) {

        console.error(
            "Ошибка загрузки сохранённой игры:",
            error
        );


        localStorage.removeItem(
            STORAGE_KEY
        );
    }
}


// ==============================
// FORMAT NUMBER
// ==============================

function formatNumber(number) {

    return new Intl.NumberFormat(
        "ru-RU"
    ).format(number);
}


// ==============================
// ESCAPE HTML
// ==============================

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ==============================
// START
// ==============================

loadQuestions();
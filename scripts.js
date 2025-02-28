const questions = [
    { question: '성별', options: ['남', '여'] },
    { question: '좌골사이즈', options: ['모름', '100이하', '105이하', '110이하', '115이하', '120이하', '125이하', '130이하', '135이하', '140이하', '140초과'] },
    { question: '좌골통증', options: ['없음', '약', '중약', '중', '중강', '강'] },
    { question: '회음부통증', options: ['없음', '약', '중약', '중', '중강', '강'] },
    { question: '라이딩 거리', options: ['5km미만', '10km미만', '20km미만', '30km미만', '50km미만', '100km미만', '100km이상'] },
    { question: '레일 규격', options: ['일반레일 7x7', '카본레일 7x9', '카본레일 7x10'] },
    { question: '가격', options: ['상관없음', '10만원이하', '20만원이하', '30만원이하', '40만원이하', '40만원초과'] }
];

let currentQuestionIndex = 0;
const answers = {};
const defaultImage = "https://raw.githubusercontent.com/twonome/saddlefinder/main/images/logo.png"; // 기본 이미지 URL

function showQuestion() {
    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = '';

    const question = questions[currentQuestionIndex];
    const questionElement = document.createElement('h2');
    questionElement.textContent = question.question;
    questionContainer.appendChild(questionElement);

    question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => {
            answers[question.question] = option;
            nextQuestion();
        };
        questionContainer.appendChild(button);
    });
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        localStorage.setItem('answers', JSON.stringify(answers));
        window.location.href = 'recommendations.html';
    }
}

async function fetchImage(url) {
    try {
        const response = await fetch(`/get-image?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        return data.imageUrl || defaultImage;
    } catch (error) {
        console.error('Error fetching image:', error);
        return defaultImage;
    }
}

async function loadRecommendations() {
    const savedAnswers = JSON.parse(localStorage.getItem('answers'));
    const container = document.querySelector('.recommendation-container');

    fetch('saddle_data.json')
        .then(response => response.json())
        .then(async data => {
            const matchedSaddles = data.filter(saddle => {
                return Object.keys(savedAnswers).every(question => {
                    const answer = savedAnswers[question];
                    return Array.isArray(saddle[question]) ? saddle[question].includes(answer) : saddle[question] === answer;
                });
            });

            if (matchedSaddles.length === 0) {
                container.innerHTML = "<p>조건에 맞는 안장이 없습니다.</p>";
            } else {
                for (const saddle of matchedSaddles) {
                    const div = document.createElement('div');
                    div.className = 'recommendation';
                    div.onclick = () => window.location.href = saddle.url;

                    const img = document.createElement('img');
                    img.src = await fetchImage(saddle.url); // 스마트스토어 URL에서 이미지 가져오기
                    img.alt = saddle.name;

                    const p = document.createElement('p');
                    p.textContent = saddle.name;

                    div.appendChild(img);
                    div.appendChild(p);
                    container.appendChild(div);
                }
            }
        })
        .catch(error => console.error('Error loading recommendations:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('recommendations')) {
        loadRecommendations();
    } else {
        showQuestion();
    }
});

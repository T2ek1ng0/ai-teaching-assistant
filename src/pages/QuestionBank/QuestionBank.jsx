import React, { useState } from 'react';
import laoguangQuestions from './FunQuestionBank/laoguang.json';
import scuterQuestions from './FunQuestionBank/scuter.json';
import guangzhouQuestions from './SeriousQuestionBank/guangzhou.json';
import scutQuestions from './SeriousQuestionBank/scut.json';
import './QuestionBank.css';

const QuestionDisplay = ({ questionData }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);

    const handleOptionClick = (option) => {
        if (!submitted) {
            setSelectedOption(option);
        }
    };

    const handleSubmit = () => {
        if (selectedOption === null) return;
        const correct = selectedOption === questionData.answer;
        setIsCorrect(correct);
        setSubmitted(true);
    };

    const handleRedo = () => {
        setSelectedOption(null);
        setIsCorrect(null);
        setSubmitted(false);
    };

    const getButtonClass = (option) => {
        if (!submitted) {
            return selectedOption === option ? 'selected' : '';
        } else {
            if (option === questionData.answer) {
                return 'correct';
            }
            if (option === selectedOption && !isCorrect) {
                return 'incorrect';
            }
        }
        return '';
    };

    return (
        <div className="question-container">
            <h4>{questionData.question}</h4>
            <div className="options-container">
                {questionData.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleOptionClick(option)}
                        className={`option-button ${getButtonClass(option)}`}
                        disabled={submitted}
                    >
                        {` ${option}`}
                    </button>
                ))}
            </div>
            
            <div className="action-buttons">
                {!submitted ? (
                    <button onClick={handleSubmit} disabled={!selectedOption} className="submit-btn">
                        提交
                    </button>
                ) : (
                    <button onClick={handleRedo} className="redo-btn">
                        重做
                    </button>
                )}
            </div>

            {submitted && !isCorrect && (
                <div className="reason-container">
                    <p><strong>解析:</strong> {questionData.reason}</p>
                </div>
            )}
            {submitted && isCorrect && (
                <div className="reason-container correct-answer">
                    <p><strong>回答正确！</strong></p>
                </div>
            )}
        </div>
    );
};


const QuestionBank = () => {
    const [selectedBank, setSelectedBank] = useState(null);

    const questionBanks = {
        'laoguang': laoguangQuestions,
        'scuter': scuterQuestions,
        'guangzhou': guangzhouQuestions,
        'scut': scutQuestions
    };

    const renderQuestions = () => {
        if (!selectedBank) {
            return <p className="initial-prompt">请从上方选择一个题库开始吧！</p>;
        }
        const bank = questionBanks[selectedBank];
        return (
            <div>
                <h2>{bank.title}</h2>
                {bank.questions.map((q, index) => (
                    <QuestionDisplay key={index} questionData={q} />
                ))}
            </div>
        );
    };

    return (
        <div className="question-bank-page">
            <h1>题库中心</h1>
            <div className="bank-selection">
                <div className="bank-category">
                    <h3>趣味题库</h3>
                    <button onClick={() => setSelectedBank('laoguang')}>正宗老广评估</button>
                    <button onClick={() => setSelectedBank('scuter')}>SCUTER评估</button>
                </div>
                <div className="bank-category">
                    <h3>正经题库</h3>
                    <button onClick={() => setSelectedBank('guangzhou')}>广州特色</button>
                    <button onClick={() => setSelectedBank('scut')}>华工特色</button>
                </div>
            </div>
            <div className="questions-display-area">
                {renderQuestions()}
            </div>
        </div>
    );
};

export default QuestionBank;
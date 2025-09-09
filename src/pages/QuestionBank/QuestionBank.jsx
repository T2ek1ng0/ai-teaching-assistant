import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button } from 'antd';
import { 
  SmileOutlined, 
  ReadOutlined, 
  CoffeeOutlined, 
  TeamOutlined, 
  BankOutlined, 
  BookOutlined 
} from '@ant-design/icons';
import laoguangQuestions from './FunQuestionBank/laoguang.json';
import scuterQuestions from './FunQuestionBank/scuter.json';
import guangzhouQuestions from './SeriousQuestionBank/guangzhou.json';
import scutQuestions from './SeriousQuestionBank/scut.json';
import './QuestionBank.css';

const { Title, Paragraph } = Typography;

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

    const questionBanksData = {
        fun: [
            {
                id: 'laoguang',
                title: '正宗老广评估',
                description: '测测你的广府文化知多少，饮茶睇戏样样精通！',
                icon: <CoffeeOutlined />,
                questions: laoguangQuestions
            },
            {
                id: 'scuter',
                title: 'SCUTER评估',
                description: '你是“华南施工大学”的合格学子吗？来挑战吧！',
                icon: <TeamOutlined />,
                questions: scuterQuestions
            }
        ],
        serious: [
            {
                id: 'guangzhou',
                title: '广州特色',
                description: '深入了解广州的历史、文化和城市风貌。',
                icon: <BankOutlined />,
                questions: guangzhouQuestions
            },
            {
                id: 'scut',
                title: '华工特色',
                description: '关于华南理工大学的“硬核”知识问答。',
                icon: <BookOutlined />,
                questions: scutQuestions
            }
        ]
    };

    const handleBankSelect = (bankId) => {
        setSelectedBank(bankId);
    };

    const renderBankSelection = () => (
        <div className="bank-selection-container">
            <div className="bank-category-wrapper">
                <Title level={3} className="category-title">
                    <SmileOutlined /> 趣味题库
                </Title>
                <Row gutter={[24, 24]}>
                    {questionBanksData.fun.map(bank => (
                        <Col xs={24} md={12} key={bank.id}>
                            <Card hoverable className="bank-card" onClick={() => handleBankSelect(bank.id)}>
                                <div className="bank-card-content">
                                    <div className="bank-card-icon">{bank.icon}</div>
                                    <div className="bank-card-text">
                                        <Title level={5}>{bank.title}</Title>
                                        <Paragraph type="secondary">{bank.description}</Paragraph>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
            <div className="bank-category-wrapper">
                <Title level={3} className="category-title">
                    <ReadOutlined /> 正经题库
                </Title>
                <Row gutter={[24, 24]}>
                    {questionBanksData.serious.map(bank => (
                        <Col xs={24} md={12} key={bank.id}>
                            <Card hoverable className="bank-card" onClick={() => handleBankSelect(bank.id)}>
                                <div className="bank-card-content">
                                    <div className="bank-card-icon">{bank.icon}</div>
                                    <div className="bank-card-text">
                                        <Title level={5}>{bank.title}</Title>
                                        <Paragraph type="secondary">{bank.description}</Paragraph>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    );

    const renderQuestions = () => {
        const allBanks = [...questionBanksData.fun, ...questionBanksData.serious];
        const bankData = allBanks.find(b => b.id === selectedBank)?.questions;

        if (!bankData) return null;

        return (
            <div className="questions-view">
                <Button onClick={() => setSelectedBank(null)} className="back-to-selection-btn">
                    &larr; 返回题库选择
                </Button>
                <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>{bankData.title}</Title>
                {bankData.questions.map((q, index) => (
                    <QuestionDisplay key={index} questionData={q} />
                ))}
            </div>
        );
    };

    return (
        <div className="question-bank-page">
            <div className="page-header">
                <Title>题库中心</Title>
                <Paragraph>在这里，你可以通过趣味问答和专业测试，检验和巩固你的学习成果。</Paragraph>
            </div>
            {selectedBank ? renderQuestions() : renderBankSelection()}
        </div>
    );
};

export default QuestionBank;
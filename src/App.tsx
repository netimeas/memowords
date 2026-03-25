import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import { Verse, allVerses } from './verses';

// 주소 정규화 헬퍼 함수
const normalizeAddress = (address: string) => {
  let normalized = address
    .replace(/장/g, ':')
    .replace(/절/g, '')
    .replace(/,/g, '')
    .replace(/\s/g, '')
    .toLowerCase();

  normalized = normalized
    .replace('고린도후서', '고후')
    .replace('고린도전서', '고전')
    .replace('갈라디아서', '갈')
    .replace('로마서', '롬')
    .replace('디모데후서', '딤후')
    .replace('여호수아', '수')
    .replace('요한복음', '요')
    .replace('빌립보서', '빌')
    .replace('마태복음', '마')
    .replace('히브리서', '히')
    .replace('이사야', '사')
    .replace('베드로전서', '벧전')
    .replace('에베소서', '엡')
    .replace('디도서', '딛')
    .replace('요한일서', '요일')
    .replace('요한계시록', '계')
    .replace('누가복음', '눅')
    .replace('예레미야애가', '애')
    .replace('민수기', '민')
    .replace('시편', '시')
    .replace('잠언', '잠')
    .replace('사도행전', '행')
    .replace('마가복음', '막')
    .replace('레위기', '레');

  return normalized;
};

// 문장 부호 확인 헬퍼 함수
const isPunctuation = (char: string) => {
  return /[.,!?;:"'‘’“”`()[\]{}<>\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F\uFF00-\uFFEF~!@#$%^&*+\-=|_\\/`]/u.test(char);
};

// 텍스트 비교 및 차이점 반환 함수
const getDiff = (original: string, user: string): { nodes: (string | React.ReactNode)[], errorCount: number } => {
  const nodes: (string | React.ReactNode)[] = [];
  let originalPtr = 0;
  let userPtr = 0;
  let errorCount = 0;
  const MAX_LOOKAHEAD_CHAR = 5;

  while (originalPtr < original.length || userPtr < user.length) {
    const originalChar = originalPtr < original.length ? original[originalPtr] : '';
    const userChar = userPtr < user.length ? user[userPtr] : '';

    const isOriginalSpace = /\s/.test(originalChar);
    const isUserSpace = /\s/.test(userChar);

    const isOriginalPunct = isPunctuation(originalChar);
    const isUserPunct = isPunctuation(userChar);

    if (
      originalPtr < original.length &&
      userPtr < user.length &&
      ((isOriginalSpace && isUserSpace) ||
        (!isOriginalSpace && !isOriginalPunct && !isUserSpace && !isUserPunct && originalChar.toLowerCase() === userChar.toLowerCase()) ||
        (isOriginalPunct && isUserPunct && originalChar === userChar))
    ) {
      nodes.push(originalChar);
      originalPtr++;
      userPtr++;
      continue;
    }

    if (originalPtr < original.length && isOriginalSpace && !isUserSpace) {
      nodes.push(originalChar);
      originalPtr++;
      continue;
    }

    if (userPtr < user.length && isUserSpace && !isOriginalSpace) {
      nodes.push(userChar);
      userPtr++;
      continue;
    }

    let isDeletionCandidate = false;
    let isInsertionCandidate = false;

    if (originalPtr + 1 < original.length && userPtr < user.length) {
      for (let k = 1; k <= MAX_LOOKAHEAD_CHAR && originalPtr + k < original.length; k++) {
        const nextOriginalChar = original[originalPtr + k];
        if (!/\s/.test(nextOriginalChar) && !isPunctuation(nextOriginalChar) &&
            !isUserSpace && !isUserPunct &&
            nextOriginalChar.toLowerCase() === userChar.toLowerCase()) {
          isDeletionCandidate = true;
          break;
        }
      }
    } else if (originalPtr < original.length && userPtr >= user.length) {
      isDeletionCandidate = true;
    }

    if (userPtr + 1 < user.length && originalPtr < original.length) {
      for (let k = 1; k <= MAX_LOOKAHEAD_CHAR && userPtr + k < user.length; k++) {
        const nextUserChar = user[userPtr + k];
        if (!/\s/.test(nextUserChar) && !isPunctuation(nextUserChar) &&
            !isOriginalSpace && !isOriginalPunct &&
            nextUserChar.toLowerCase() === originalChar.toLowerCase()) {
          isInsertionCandidate = true;
          break;
        }
      }
    } else if (userPtr < user.length && originalPtr >= original.length) {
      isInsertionCandidate = true;
    }

    if (isDeletionCandidate && !isInsertionCandidate) {
      nodes.push(<span key={`del-${originalPtr}`} style={{ backgroundColor: '#fee2e2', borderRadius: '4px', padding: '0 4px' }}>{originalChar}</span>);
      if (!isOriginalSpace && !isOriginalPunct) {
        errorCount++;
      }
      originalPtr++;
    } else if (isInsertionCandidate && !isDeletionCandidate) {
      nodes.push(<span key={`ins-${userPtr}`} style={{ backgroundColor: '#dcfce7', borderRadius: '4px', padding: '0 4px' }}>{userChar}</span>);
      if (!isUserSpace && !isUserPunct) {
        errorCount++;
      }
      userPtr++;
    } else {
      if (originalPtr < original.length) {
        if ((!isOriginalSpace && !isOriginalPunct && originalChar.toLowerCase() !== userChar.toLowerCase()) ||
            (!isOriginalPunct && isUserPunct) || 
            (isOriginalPunct && !isUserPunct)) { 
          nodes.push(<span key={`sub-orig-${originalPtr}`} style={{ backgroundColor: '#fee2e2', borderRadius: '4px', padding: '0 4px' }}>{originalChar}</span>);
          if (!isOriginalPunct || (!isOriginalPunct && isUserPunct)) { 
              errorCount++;
          }
        } else {
          nodes.push(originalChar);
        }
        originalPtr++;
      }

      if (userPtr < user.length) {
        if ((!isUserSpace && !isUserPunct && originalChar.toLowerCase() !== userChar.toLowerCase()) ||
            (!isUserPunct && isOriginalPunct) || 
            (isUserPunct && !isOriginalPunct)) { 
          nodes.push(<span key={`sub-user-${userPtr}`} style={{ backgroundColor: '#dcfce7', borderRadius: '4px', padding: '0 4px' }}>{userChar}</span>);
          if (!isUserPunct || (!isUserPunct && isOriginalPunct)) { 
             if (originalPtr >= original.length && !isUserSpace && !isUserPunct) {
                errorCount++;
             }
          }
        } else {
          nodes.push(userChar);
        }
        userPtr++;
      }
    }
  }

  return { nodes, errorCount };
};

// Verse ID 정렬 함수
const sortVersesById = (a: Verse, b: Verse) => {
  const groupA = a.id.split('-')[0];
  const groupB = b.id.split('-')[0];

  if (groupA < groupB) return -1;
  if (groupA > groupB) return 1;

  const numA = parseInt(a.id.split('-')[1]);
  const numB = parseInt(b.id.split('-')[1]);
  return numA - numB;
};

// App 컴포넌트 정의
const App: React.FC = () => {
  const [mode, setMode] = useState<'PLTC' | 'LTC' | 'SPECIFIC'>('PLTC');
  const [practiceMode, setPracticeMode] = useState(true);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [userInputAddress, setUserInputAddress] = useState('');
  const [userInputText, setUserInputText] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrectAddress, setIsCorrectAddress] = useState(false);
  const [isCorrectText, setIsCorrectText] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<React.ReactNode | string>('');
  const [needsPracticeVerses, setNeedsPracticeVerses] = useState<Verse[]>([]);
  const [currentPracticeVerses, setCurrentPracticeVerses] = useState<Verse[]>([]);
  const [testResults, setTestResults] = useState<{ id: string; correct: boolean; diff: (string | React.ReactNode)[] }[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedSpecificVerses, setSelectedSpecificVerses] = useState<string[]>([]);

  const addressInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const getVersesForMode = useCallback(() => {
    if (mode === 'PLTC') {
      return allVerses.filter(verse => verse.group === 'A' || verse.group === 'B');
    } else if (mode === 'LTC') {
      return allVerses;
    } else if (mode === 'SPECIFIC') {
      return allVerses.filter(verse => selectedSpecificVerses.includes(verse.id));
    }
    return [];
  }, [mode, selectedSpecificVerses]);

  useEffect(() => {
    setCurrentVerseIndex(0);
    setNeedsPracticeVerses([]);
    setTestResults([]);
    setShowSummary(false);
    resetInputs();

    if (mode !== 'SPECIFIC') {
      const verses = getVersesForMode();
      if (practiceMode) {
        setCurrentPracticeVerses(verses);
      } else {
        const shuffledVerses = [...verses].sort(() => 0.5 - Math.random());
        const selectedAndSortedVerses = shuffledVerses.slice(0, 10).sort(sortVersesById);
        setCurrentPracticeVerses(selectedAndSortedVerses);
      }
    } else {
      setCurrentPracticeVerses([]);
    }
  }, [mode, practiceMode, getVersesForMode]);

  const resetInputs = () => {
    setUserInputAddress('');
    setUserInputText('');
    setShowAnswer(false);
    setIsCorrectAddress(false);
    setIsCorrectText(false);
    setFeedbackMessage('');
    addressInputRef.current?.focus();
  };

  const handleToggleSpecificVerse = (verseId: string) => {
    setSelectedSpecificVerses(prev =>
      prev.includes(verseId)
        ? prev.filter(id => id !== verseId)
        : [...prev, verseId].sort()
    );
  };

  const handleTogglePart = (part: 'A' | 'B' | 'C' | 'D' | 'E') => {
    const partVerseIds = allVerses
      .filter(verse => verse.group === part)
      .map(verse => verse.id);

    const areAllSelected = partVerseIds.every(id => selectedSpecificVerses.includes(id));

    if (areAllSelected) {
      setSelectedSpecificVerses(prev => prev.filter(id => !partVerseIds.includes(id)));
    } else {
      setSelectedSpecificVerses(prev => {
        const newSelection = [...prev];
        partVerseIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection.sort();
      });
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedSpecificVerses.length === allVerses.length) {
      setSelectedSpecificVerses([]);
    } else {
      setSelectedSpecificVerses(allVerses.map(verse => verse.id));
    }
  };

  const handleStartSpecificTest = () => {
    if (selectedSpecificVerses.length === 0) {
      alert('테스트할 구절을 하나 이상 선택해주세요.');
      return;
    }
    const versesToTest = allVerses.filter(verse => selectedSpecificVerses.includes(verse.id)).sort(sortVersesById);
    setCurrentPracticeVerses(versesToTest);
    setCurrentVerseIndex(0);
    setTestResults([]);
    setShowSummary(false);
    resetInputs();
  };

  const handleComplete = () => {
    if (currentPracticeVerses.length === 0) return;

    const currentVerse = currentPracticeVerses[currentVerseIndex];
    const normalizedCorrectAddress = normalizeAddress(currentVerse.address);
    const normalizedUserAddress = normalizeAddress(userInputAddress);
    
    const addressMatch = normalizedCorrectAddress === normalizedUserAddress;
    const contentCorrectText = currentVerse.text.replace(/[\s.,!?;:"'‘’“”`()[\]{}<>\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F\uFF00-\uFFEF~!@#$%^&*+-=|\\/`_]/gu, '').toLowerCase();
    const contentUserText = userInputText.replace(/[\s.,!?;:"'‘’“”`()[\]{}<>\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F\uFF00-\uFFEF~!@#$%^&*+-=|\\/`_]/gu, '').toLowerCase();
    const textContentMatch = contentCorrectText === contentUserText;

    setIsCorrectAddress(addressMatch);
    setIsCorrectText(textContentMatch);
    setShowAnswer(true);

    let diffNodesForResults: (string | React.ReactNode)[] = [];

    if (textContentMatch && addressMatch) {
      setFeedbackMessage('정답과 일치합니다.');
      if (practiceMode) { 
        setNeedsPracticeVerses(prev => prev.filter(v => v.id !== currentVerse.id));
      }
    } else {
      const { nodes: textDiffNodes, errorCount: diffErrorCount } = getDiff(currentVerse.text, userInputText);
      diffNodesForResults = textDiffNodes;
      setFeedbackMessage(
        <>
          <p>주소: {addressMatch ? '일치' : <span style={{ color: '#ef4444', fontWeight: 'bold' }}>오류 (정답: {currentVerse.address})</span>}</p>
          <p style={{ marginTop: '0.5rem' }}>본문:</p>
          <div style={{ backgroundColor: '#f3f4f6', padding: '0.5rem', borderRadius: '0.375rem', fontFamily: 'monospace', fontSize: '0.875rem', textAlign: 'left' }}>{textDiffNodes}</div>
          <p style={{ marginTop: '1rem', fontWeight: 'bold', color: '#dc2626' }}>틀린 글자 수: {diffErrorCount}</p>
        </>
      );

      if (practiceMode && !needsPracticeVerses.some(v => v.id === currentVerse.id)) {
        setNeedsPracticeVerses(prev => [...prev, currentVerse]);
      }
    }

    setTestResults(prev => {
      const existingIndex = prev.findIndex(r => r.id === currentVerse.id);
      const newResult = { id: currentVerse.id, correct: (addressMatch && textContentMatch), diff: diffNodesForResults };
      if (existingIndex >= 0) {
        const newResults = [...prev];
        newResults[existingIndex] = newResult;
        return newResults;
      }
      return [...prev, newResult];
    });
  };

  const handlePracticeAgain = () => {
    resetInputs(); 
  };

  const handleNeedsPractice = () => {
    if (currentPracticeVerses.length === 0) return;

    const currentVerse = currentPracticeVerses[currentVerseIndex];
    if (!needsPracticeVerses.some(v => v.id === currentVerse.id)) {
      setNeedsPracticeVerses(prev => [...prev, currentVerse]);
    }
    moveToNextVerse();
  };

  const handleRecitationComplete = () => {
    if (currentPracticeVerses.length === 0) return;

    const currentVerse = currentPracticeVerses[currentVerseIndex];
    setNeedsPracticeVerses(prev => prev.filter(v => v.id !== currentVerse.id));
    moveToNextVerse();
  };

  const moveToNextVerse = () => {
    resetInputs();
    if (currentVerseIndex < currentPracticeVerses.length - 1) {
      setCurrentVerseIndex(prev => prev + 1);
    } else {
      if (practiceMode) {
        if (needsPracticeVerses.length > 0) {
          setCurrentPracticeVerses(needsPracticeVerses);
          setNeedsPracticeVerses([]);
          setCurrentVerseIndex(0);
        } else {
          setShowSummary(true);
        }
      } else {
        setShowSummary(true);
      }
    }
  };

  const handleReset = () => {
    setSelectedSpecificVerses([]);
    setMode('PLTC');
    setPracticeMode(true);
    setCurrentPracticeVerses(getVersesForMode());
    setCurrentVerseIndex(0);
    setNeedsPracticeVerses([]);
    setTestResults([]);
    setShowSummary(false);
    resetInputs();
  };

  const currentVerse = currentPracticeVerses[currentVerseIndex];

  return (
    <div className="app-container">
      <header className="header-container">
        <h1 className="header-title">주제별 성경 암송</h1>
        <div className="header-button-container">
          <button
            onClick={() => { setMode('PLTC'); setPracticeMode(true); }}
            className={`header-button ${mode === 'PLTC' ? 'active' : 'inactive'}`}
          >
            PLTC
          </button>
          <button
            onClick={() => { setMode('LTC'); setPracticeMode(true); }}
            className={`header-button ${mode === 'LTC' ? 'active' : 'inactive'}`}
          >
            LTC
          </button>
          <button
            onClick={() => { setMode('SPECIFIC'); setPracticeMode(true); }} 
            className={`header-button ${mode === 'SPECIFIC' ? 'active' : 'inactive'}`}
          >
            특정 구절
          </button>
        </div>
        <div className="reset-button-wrapper">
            <button
                onClick={handleReset}
                className="action-button reset"
            >
                초기화
            </button>
        </div>
      </header>

      <main className="main-content">
        {mode !== 'SPECIFIC' && (
          <div className="mode-selection-container">
            <button
              onClick={() => setPracticeMode(true)}
              className={`mode-button ${practiceMode ? 'practice-active' : 'practice-inactive'}`}
            >
              연습 모드
            </button>
            <button
              onClick={() => setPracticeMode(false)}
              className={`mode-button ${!practiceMode ? 'real-active' : 'real-inactive'}`}
            >
              실전 모드
            </button>
          </div>
        )}

        {mode === 'SPECIFIC' && currentPracticeVerses.length === 0 && !showSummary ? (
          <div className="specific-verse-selection-container">
            <h2 className="specific-verse-selection-title">테스트할 구절 선택</h2>
            <div className="part-selection-container">
                {(['A', 'B', 'C', 'D', 'E'] as const).map(part => (
                    <button key={part} onClick={() => handleTogglePart(part)} className="part-button">
                        Part {part}
                    </button>
                ))}
                <button onClick={handleToggleSelectAll} className="part-button all">
                    {selectedSpecificVerses.length === allVerses.length ? '전체 해제' : '전체 선택'}
                </button>
            </div>
            <div className="verse-grid">
              {allVerses.map(verse => (
                <div key={verse.id} className="verse-select-item">
                  <input
                    type="checkbox"
                    id={`verse-${verse.id}`}
                    checked={selectedSpecificVerses.includes(verse.id)}
                    onChange={() => handleToggleSpecificVerse(verse.id)}
                    className="checkbox-input"
                  />
                  <label htmlFor={`verse-${verse.id}`} className="verse-label">
                    {verse.id}
                  </label>
                </div>
              ))}
            </div>
            <button
              onClick={handleStartSpecificTest}
              className="action-button complete"
              style={{ marginTop: '2rem' }}
            >
              테스트 시작 ({selectedSpecificVerses.length}개)
            </button>
          </div>
        ) : showSummary ? (
          <div className="summary-container">
            <h2 className="summary-title">테스트 결과 요약</h2>
            {testResults.map((result, index) => (
              <div key={index} className="summary-item">
                <p className="summary-item-title">{result.id}: {result.correct ? <span style={{ color: '#10b981' }}>정답</span> : <span style={{ color: '#ef4444' }}>오답</span>}</p>
                {!result.correct && result.diff && result.diff.length > 0 && (
                  <>
                    <p style={{ marginTop: '0.5rem' }}>원문:</p>
                    <div style={{ backgroundColor: '#f3f4f6', padding: '0.5rem', borderRadius: '0.375rem', fontFamily: 'monospace', fontSize: '0.875rem', textAlign: 'left' }}>
                      {allVerses.find(v => v.id === result.id)?.text}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          currentVerse ? (
            <>
              <div className="current-verse-id">
                <p className="current-verse-id-text">
                  <span className="current-verse-id-number">{currentVerse.id}</span>
                  {` (${currentVerseIndex + 1}/${currentPracticeVerses.length})`}
                </p>
              </div>

              <div className="input-group">
                <label htmlFor="address" className="input-label">주소</label>
                <input
                  type="text"
                  id="address"
                  ref={addressInputRef}
                  value={userInputAddress}
                  onChange={(e) => setUserInputAddress(e.target.value)}
                  className="input-field"
                  placeholder="예: 창 1:1 또는 창세기 1장 1절"
                />
              </div>

              <div className="input-group">
                <label htmlFor="text" className="input-label">본문</label>
                <textarea
                  id="text"
                  ref={textInputRef}
                  value={userInputText}
                  onChange={(e) => setUserInputText(e.target.value)}
                  rows={8}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                  placeholder="구절의 본문을 입력하세요."
                ></textarea>
              </div>

              <div className="action-button-container">
                <button
                  onClick={handleComplete}
                  className="action-button complete"
                >
                  완료
                </button>
              </div>

              {showAnswer && (
                <div className="feedback-section">
                  <h3 className="feedback-title">정답</h3>
                  <div className="feedback-verse-info">
                    <p className="feedback-address">주소: <span style={{ color: isCorrectAddress ? '#10b981' : '#ef4444' }}>{currentVerse.address}</span></p>
                    <p className="feedback-text-label">본문:</p>
                    <p className="feedback-correct-text">{currentVerse.text}</p>
                  </div>
                  {feedbackMessage && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      fontWeight: '600',
                      backgroundColor: (isCorrectText && isCorrectAddress) ? '#d1fae5' : '#fee2e2',
                      color: (isCorrectText && isCorrectAddress) ? '#065f46' : '#991b1b',
                    }}>
                      {feedbackMessage}
                    </div>
                  )}

                  {practiceMode && (
                    <div className="practice-button-container">
                      <button
                        onClick={handleNeedsPractice}
                        className="action-button practice-needed"
                      >
                        연습 필요
                      </button>
                      <button
                        onClick={handlePracticeAgain}
                        className="action-button"
                        style={{ backgroundColor: '#8b5cf6' }}
                      >
                        다시 연습
                      </button>
                      <button
                        onClick={handleRecitationComplete}
                        className="action-button recitation-complete"
                      >
                        암송 완료
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="no-verse-message">
              선택된 모드에 해당하는 구절이 없습니다.
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default App;
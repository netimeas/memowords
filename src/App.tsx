import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css'; // App.css 파일을 임포트합니다.

// 성경 구절 하나의 구조를 정의합니다.
interface Verse {
  id: string;
  address: string;
  text: string;
  group: 'A' | 'B' | 'C' | 'D' | 'E';
}

// "주제별 성경 말씀 60구절 암송.txt" 파일에서 파싱된 모든 60개 구절 데이터입니다.
const allVerses: Verse[] = [
  { id: 'A-1', address: '고린도후서 5장 17절', text: '그런즉 누구든지 그리스도 안에 있으면 새로운 피조물이라 이전 것은 지나갔으니 보라 새 것이 되었도다', group: 'A' },
  { id: 'A-2', address: '갈라디아서 2장 20절', text: '내가 그리스도와 함께 십자가에 못 박혔나니 그런즉 이제는 내가 사는 것이 아니요 오직 내 안에 그리스도께서 사시는 것이라 이제 내가 육체 가운데 사는 것은 나를 사랑하사 나를 위하여 자기 자신을 버리신 하나님의 아들을 믿는 믿음 안에서 사는 것이라', group: 'A' },
  { id: 'A-3', address: '로마서 12장 1절', text: '그러므로 형제들아 내가 하나님의 모든 자비하심으로 너희를 권하노니 너희 몸을 하나님이 기뻐하시는 거룩한 산 제물로 드리라 이는 너희가 드릴 영적 예배니라', group: 'A' },
  { id: 'A-4', address: '요한복음 14장 21절', text: '나의 계명을 지키는 자라야 나를 사랑하는 자니 나를 사랑하는 자는 내 아버지께 사랑을 받을 것이요 나도 그를 사랑하여 그에게 나를 나타내리라', group: 'A' },
  { id: 'A-5', address: '디모데후서 3장 16절', text: '모든 성경은 하나님의 감동으로된 것으로 교훈과 책망과 바르게함과 의로 교육하기에 유익하니', group: 'A' },
  { id: 'A-6', address: '여호수아 1장 8절', text: '이 율법책을 네 입에서 떠나지 말게 하며 주야로 그것을 묵상하여 그 안에 기록된 대로 다 지켜 행하라 그리하면 네 길이 평탄하게 될 것이며 네가 형통하리라', group: 'A' },
  { id: 'A-7', address: '요한복음 15장 7절', text: '너희가 내 안에 거하고 내 말이 너희 안에 거하면 무엇이든지 원하는 대로 구하라 그리하면 이루리라', group: 'A' },
  { id: 'A-8', address: '빌립보서 4장 6-7절', text: '아무 것도 염려하지 말고 다만 모든 일에 기도와 간구로 너희 구할 것을 감사함으로 하나님께 아뢰라 그리하면 모든 지각에 뛰어난 하나님의 평강이 그리스도 예수 안에서 너희 마음과 생각을 지키시리라', group: 'A' },
  { id: 'A-9', address: '마태복음 18장 20절', text: '두세 사람이 내 이름으로 모인 곳에는 나도 그들 중에 있느느라', group: 'A' },
  { id: 'A-10', address: '히브리서 10장 24-25절', text: '서로 돌아보아 사랑과 선행을 격려하며 모이기를 폐하는 어떤 사람들의 습관과 같이 하지 말고 오직 권하여 그 날이 가까움을 볼수록 더욱 그리하자', group: 'A' },
  { id: 'A-11', address: '마태복음 4장 19절', text: '말씀하시되 나를 따라오라 내가 너희를 사람을 낚는 어부가 되게 하리라 하시니', group: 'A' },
  { id: 'A-12', address: '로마서 1장 16절', text: '내가 복음을 부끄러워하지 아니하노니 이 복음은 모든 믿는 자에게 구원을 주시는 하나님의 능력이 됨이라 먼저는 유대인에게요 그리고 헬라인에게로다', group: 'A' },
  { id: 'B-1', address: '로마서 3장 23절', text: '모든 사람이 죄를 범하였으매 하나님의 영광에 이르지 못하더니', group: 'B' },
  { id: 'B-2', address: '이사야 53장 6절', text: '우리는 다 양 같아서 그릇 행하여 각기 제 길로 갔거늘 여호와께서는 우리 모두의 죄악을 그에게 담당시키셨도다', group: 'B' },
  { id: 'B-3', address: '로마서 6장 23절', text: '죄의 삯은 사망이요 하나님의 은사는 그리스도 예수 우리 주 안에 있는 영생이니라', group: 'B' },
  { id: 'B-4', address: '히브리서 9장 27절', text: '한번 죽는 것은 사람에게 정해진 것이요 그 후에는 심판이 있으리니', group: 'B' },
  { id: 'B-5', address: '로마서 5장 8절', text: '우리가 아직 죄인되었을 때에 그리스도께서 우리를 위하여 죽으심으로 하나님께서 우리에 대한 자기의 사랑을 확증하셨느느라', group: 'B' },
  { id: 'B-6', address: '베드로전서 3장 18절', text: '그리스도께서도 단번에 죄를 위하여 죽으사 의인으로서 불의한 자를 대신하셨으니 이는 우리를 하나님 앞으로 인도하려 하심이라 육체로는 죽임을 당하시고 영으로는 살리심을 받으셨으니', group: 'B' },
  { id: 'B-7', address: '에베소서 2장 8,9절', text: '너희는 그 은혜에 의하여 믿음으로 말미암아 구원을 받았으니 이것은 너희에게서 난 것이 아니요 하나님의 선물이라 행위에서 난 것이 아니니 이는 누구든지 자랑하지 못하게 함이라', group: 'B' },
  { id: 'B-8', address: '디도서 3장 5절', text: '우리를 구원하시되 우리가 행한 바 의로운 행위로 말미암지 아니하고 오직 그의 긍휼하심을 따라 중생의 씻음과 성령의 새롭게 하심으로 하셨나니', group: 'B' },
  { id: 'B-9', address: '요한복음 1장 12절', text: '영접하는 자 곧 그 이름을 믿는 자들에게는 하나님의 자녀가 되는 권세를 주셨으니', group: 'B' },
  { id: 'B-10', address: '요한계시록 3장 20절', text: '볼지어다 내가 문 밖에 서서 두드리노니 누구든지 내 음성을 듣고 문을 열면 내가 그에게로 들어가 그와 더불어 먹고 그는 나와 더불어 먹으리라', group: 'B' },
  { id: 'B-11', address: '요한일서 5장 13절', text: '내가 하나님의 아들의 이름을 믿는 너희에게 이것을 쓰는 것은 너희로 하여금 너희에게 영생이 있음을 알게 하려 함이라', group: 'B' },
  { id: 'B-12', address: '요한복음 5장 24절', text: '내가 진실로 진실로 너희에게 이르노니 내 말을 듣고 또 나 보내신 이를 믿는 자는 영생을 얻었고 심판에 이르지 아니하나니 사망에서 생명으로 옮겼느니라', group: 'B' },
  { id: 'C-1', address: '고린도전서 3장 16절', text: '너희는 너희가 하나님의 성전인 것과 하나님의 성령이 너희 안에 계시는 것을 알지 못하느냐', group: 'C' },
  { id: 'C-2', address: '고린도전서 2장 12절', text: '우리가 세상의 영을 받지 아니하고 오직 하나님으로부터 온 영을 받았으니 이는 우리로 하여금 하나님께서 우리에게 은혜로 주신 것들을 알게 하려 하심이라', group: 'C' },
  { id: 'C-3', address: '이사야 41장 10절', text: '두려워하지 말라 내가 너와 함께 함이라 놀라지 말라 나는 네 하나님이 됨이라 내가 너를 굳세게 하리라 참으로 너를 도와 주리라 참으로 나의 의로운 오른손으로 너를 붙들리라', group: 'C' },
  { id: 'C-4', address: '빌립보서 4장 13절', text: '내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라', group: 'C' },
  { id: 'C-5', address: '예레미야애가 3장 22,23절', text: '여호와의 인자와 긍휼이 무궁하시므로 우리가 진멸되지 아니함이니이다 이것들이 아침마다 새로우니 주의 성실하심이 크시도소이다', group: 'C' },
  { id: 'C-6', address: '민수기 23장 19절', text: '하나님은 사람이 아니시니 거짓말을 하지 않으시고 인생이 아니시니 후회가 없으시도다 어찌 그 말씀하신 바를 행하지 아니하시며, 하신 말씀을 실행하지 아니하시랴', group: 'C' },
  { id: 'C-7', address: '이사야 26장 3절', text: '주께서 심지가 견고한 자를 평강하고 평강하도록 지키시리니 이는 그가 주를 신뢰함이니이다', group: 'C' },
  { id: 'C-8', address: '베드로전서 5장 7절', text: '너희 염려를 다 주께 맡기라 이는 그가 너희를 돌보심이라', group: 'C' },
  { id: 'C-9', address: '로마서 8장 32절', text: '자기 아들을 아끼지 아니하시고 우리 모든 사람을 위하여 내주신 이가 어찌 그 아들과 함께 모든 것을 우리에게 주시지 아니하겠느냐', group: 'C' },
  { id: 'C-10', address: '빌립보서 4장 19절', text: '나의 하나님이 그리스도 예수 안에서 영광 가운데 그 풍성한 대로 너희 모든 쓸 것을 채우시리라', group: 'C' },
  { id: 'C-11', address: '히브리서 2장 18절', text: '그가 시험을 받아 고난을 당하였은즉 시험 받는 자들을 능히 도우실 수 있느니라', group: 'C' },
  { id: 'C-12', address: '시편 119편 9절,11절', text: '청년이 무엇으로 그의 행실을 깨끗하게 하리이까. 주의 말씀만 지킬 따름이니이다 내가 주께 범죄하지 아니하려 하여 주의 말씀을 내 마음에 두었나이다', group: 'C' },
  { id: 'D-1', address: '마태복음 6장 33절', text: '그런즉 너희는 먼저 그의 나라와 그의 의를 구하라 그리하면 이 모든 것을 너희에게 더하시리라', group: 'D' },
  { id: 'D-2', address: '누가복음 9장 23절', text: '또 무리에게 이르시되, 아무든지 나를 따라오려거든 자기를 부인하고 날마다 제 십자가를 지고 나를 따를 것이니라', group: 'D' },
  { id: 'D-3', address: '요한일서 2장 15-16절', text: '이 세상이나 세상에 있는 것들을 사랑하지 말라 누구든지 세상을 사랑하면 아버지의 사랑이 그 안에 있지 아니하니 이는 세상에 있는 모든 것이 육신의 정욕과 안목의 정욕과 이생의 자랑이니 다 아버지께로부터 온 것이 아니요 세상으로부터 온 것이라', group: 'D' },
  { id: 'D-4', address: '로마서 12장 2절', text: '너희는 이 세대를 본받지 말고 오직 마음을 새롭게 함으로 변화를 받아 하나님의 선하시고 기뻐하시고 온전하신 뜻이 무엇인지 분별하도록 하라', group: 'D' },
  { id: 'D-5', address: '고린도전서 15장 58절', text: '그러므로 내 사랑하는 형제들아 견실하며 흔들리지 말고 항상 주의 일에 더욱 힘쓰는 자들이 되라 이는 너희 수고가 주 안에서 헛되지 않은 줄 앎이라', group: 'D' },
  { id: 'D-6', address: '히브리서 12장 3절', text: '너희가 피곤하여 낙심하지 않기 위하여 죄인들이 이같이 자기에게 거역한 일을 참으신 이를 생각하라', group: 'D' },
  { id: 'D-7', address: '마가복음 10장 45절', text: '인자가 온 것은 섬김을 받으려 함이 아니라 도리어 섬기려 하고 자기 목숨을 많은 사람의 대속물로 주려 함이니라', group: 'D' },
  { id: 'D-8', address: '고린도후서 4장 5절', text: '우리는 우리를 전파하는 것이 아니라 오직 그리스도 예수의 주 되신 것과 또 예수를 위하여 우리가 너희의 종 된 것을 전파함이라', group: 'D' },
  { id: 'D-9', address: '잠언 3장 9-10절', text: '네 재물과 네 소산물의 처음 익은 열매로 여호와를 공경하라 그리하면 네 창고가 가득히 차고 네 포도즙 틀에 새 포도즙이 넘치리라', group: 'D' },
  { id: 'D-10', address: '고린도후서 9장 6-7절', text: '이것이 곧 적게 심는 자는 적게 거두고 많이 심는 자는 많이 거둔다 하는 말이로다 각각 그 마음에 정한 대로 할 것이요 인색함으로나 억지로 하지 말지니 하나님은 즐겨 내는 자를 사랑하시느니라', group: 'D' },
  { id: 'D-11', address: '사도행전 1장 8절', text: '오직 성령이 너희에게 임하시면 너희가 권능을 받고 예루살렘과 온 유대와 사마리아와 땅 끝까지 이르러 내 증인이 되리라 하시니라', group: 'D' },
  { id: 'D-12', address: '마태복음 28장 19-20절', text: '그러므로 너희는 가서 모든 민족을 제자로 삼아 아버지와 아들과 성령의 이름으로 세례를 베풀고 내가 너희에게 분부한 모든 것을 가르쳐 지키게 하라 볼지어다 내가 세상 끝날까지 너희와 항상 함께 있으리라 하시니라', group: 'D' },
  { id: 'E-1', address: '요한복음 13장 34-35절', text: '새 계명을 너희에게 주노니 서로 사랑하라 내가 너희를 사랑한 것 같이 너희도 서로 사랑하라 너희가 서로 사랑하면 이로써 모든 사람이 너희가 내 제자인 줄 알리라', group: 'E' },
  { id: 'E-2', address: '요한일서 3장 18절', text: '자녀들아 우리가 말과 혀로만 사랑하지 말고 행함과 진실함으로 하자', group: 'E' },
  { id: 'E-3', address: '빌립보서 2장 3-4절', text: '아무 일에든지 다툼이나 허영으로 하지 말고 오직 겸손한 마음으로 각각 자기보다 남을 낫게 여기고, 각각 자기 일을 돌볼 뿐더러 또한 각각 다른 사람들의 일을 돌보아 나의 기쁨을 충만하게 하라', group: 'E' },
  { id: 'E-4', address: '베드로전서 5장 5-6절', text: '젊은 자들아 이와 같이 장로들에게 순종하고 다 서로 겸손으로 허리를 동이라 하나님은 교만한 자를 대적하시되 겸손한 자들에게는 은혜를 주시느니라 그러므로 하나님의 능하신 손 아래에서 겸손하라 때가 되면 너희를 높이시리라', group: 'E' },
  { id: 'E-5', address: '에베소서 5장 3절', text: '음행과 온갖 더러운 것과 탐욕은 너희 중에서 그 이름조차도 부르지 말라 이는 성도에게 마땅한 바니라', group: 'E' },
  { id: 'E-6', address: '베드로전서 2장 11절', text: '사랑하는 자들아 거류민과 나그네 같은 너희를 권하노니 영혼을 거슬러 싸우는 육체의 정욕을 제어하라', group: 'E' },
  { id: 'E-7', address: '레위기 19장 11절', text: '너희는 도둑질하지 말며 속이지 말며 서로 거짓말하지 말며', group: 'E' },
  { id: 'E-8', address: '사도행전 24장 16절', text: '이것으로 말미암아 나도 하나님과 사람에 대하여 항상 양심에 거리낌이 없기를 힘쓰나이다', group: 'E' },
  { id: 'E-9', address: '히브리서 11장 6절', text: '믿음이 없이는 하나님을 기쁘시게 하지 못하나니, 하나님께 나아가는 자는 반드시 그가 계신 것과 또한 그가 자기를 찾는 자들에게 상 주시는 이심을 믿어야 할지니라', group: 'E' },
  { id: 'E-10', address: '로마서 4장 20-21절', text: '믿음이 없어 하나님의 약속을 의심하지 않고, 믿음으로 견고하여져서 하나님께 영광을 돌리며 약속하신 그것을 또한 능히 이루실 줄을 확신하였으니', group: 'E' },
  { id: 'E-11', address: '갈라디아서 6장 9-10절', text: '우리가 선을 행하되 낙심하지 말지니 포기하지 아니하면 때가 이르매 거두리라 그러므로 우리는 기회 있는 대로 모든 이에게 착한 일을 하되 더욱 믿음의 가정들에게 할지니라', group: 'E' },
  { id: 'E-12', address: '마태복음 5장 16절', text: '이같이 너희 빛이 사람 앞에 비치게 하여 그들로 너희 착한 행실을 보고 하늘에 계신 너희 아버지께 영광을 돌리게 하라', group: 'E' },
];

// 텍스트를 비교하기 위해 정규화하는 헬퍼 함수 (공백, 구두점 제거).
const normalizeText = (text: string) => {
  return text.replace(/[\s.,!?;:"'‘’“”`()\[\]{}]/g, '').toLowerCase();
};

// 주소를 비교하기 위해 정규화하는 헬퍼 함수.
const normalizeAddress = (address: string) => {
  // 한국어 장/절 표시를 숫자로 대체하고 공백을 제거합니다.
  let normalized = address
    .replace(/장/g, ':')
    .replace(/절/g, '')
    .replace(/,/g, '') // 22,23절과 같은 경우 쉼표를 제거합니다.
    .replace(/\s/g, '')
    .toLowerCase();

  // 일반적인 약어를 처리합니다.
  normalized = normalized
    .replace('고린도후서', '고후')
    .replace('고린도전서', '고전')
    .replace('갈라디아서', '갈')
    .replace('로마서', '롬')
    .replace('디모데후서', '딤후')
    .replace('여호수아', '여호수아') // 이 책은 일반적인 약어가 없습니다.
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
    .replace('예레미야애가', '렘애')
    .replace('민수기', '민')
    .replace('시편', '시')
    .replace('잠언', '잠')
    .replace('사도행전', '행')
    .replace('마가복음', '막')
    .replace('레위기', '레');

  return normalized;
};

// 문장 부호 및 특수 문자를 확인하는 헬퍼 함수
const isPunctuation = (char: string) => {
  // 일반적인 문장 부호, 한국어 문장 부호, 일부 특수 기호 포함 (공백 제외)
  return /[.,!?;:"'‘’“”`()\[\]{}<>\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F\uFF00-\uFFEF~!@#$%^&*+\-=|_\\/`]/u.test(char);
};

// 텍스트를 비교하고 차이점을 반환하는 함수입니다.
const getDiff = (original: string, user: string): { nodes: (string | React.ReactNode)[], errorCount: number } => {
  const nodes: (string | React.ReactNode)[] = [];
  let originalPtr = 0;
  let userPtr = 0;
  let errorCount = 0;

  // 재동기화를 위해 문자를 얼마나 미리 볼지 결정하는 상수
  const MAX_LOOKAHEAD_CHAR = 5;

  while (originalPtr < original.length || userPtr < user.length) {
    const originalChar = originalPtr < original.length ? original[originalPtr] : '';
    const userChar = userPtr < user.length ? user[userPtr] : '';

    const isOriginalSpace = /\s/.test(originalChar);
    const isUserSpace = /\s/.test(userChar);

    const isOriginalPunct = isPunctuation(originalChar);
    const isUserPunct = isPunctuation(userChar);

    // Case 1: 완벽하게 일치하는 경우 (공백 및 구두점 아닌 문자, 대소문자 구분 없음)
    // 또는 둘 다 공백인 경우 (띄어쓰기는 에러로 처리하지 않음)
    if (originalPtr < original.length && userPtr < user.length &&
        (isOriginalSpace && isUserSpace ||
         (!isOriginalSpace && !isOriginalPunct && !isUserSpace && !isUserPunct && originalChar.toLowerCase() === userChar.toLowerCase()) ||
         (isOriginalPunct && isUserPunct && originalChar === userChar))) // 동일한 구두점 일치
    {
      nodes.push(originalChar);
      originalPtr++;
      userPtr++;
      continue;
    }

    // Case 2: 원본은 공백인데 사용자는 공백이 아닌 경우
    if (originalPtr < original.length && isOriginalSpace && !isUserSpace) {
      nodes.push(originalChar);
      originalPtr++;
      continue;
    }

    // Case 3: 사용자는 공백인데 원본은 공백이 아닌 경우
    if (userPtr < user.length && isUserSpace && !isOriginalSpace) {
      nodes.push(userChar);
      userPtr++;
      continue;
    }

    // 여기까지 도달하면, 공백이 아닌 문자들 간의 불일치이거나 한 문자열이 끝난 경우입니다.
    // 삽입, 삭제 또는 대체를 판단하기 위해 미리보기를 사용합니다.
    let isDeletionCandidate = false; // 원본 문자가 사용자 입력에 없는 경우
    let isInsertionCandidate = false; // 사용자 문자가 원본에 추가된 경우

    // 삭제 후보인지 확인: 사용자 문자가 원본의 다음 문자(들)와 일치하는가?
    if (originalPtr + 1 < original.length && userPtr < user.length) {
      for (let k = 1; k <= MAX_LOOKAHEAD_CHAR && originalPtr + k < original.length; k++) {
        const nextOriginalChar = original[originalPtr + k];
        // 공백이나 구두점 아닌, 유의미한 글자로 재동기화 시도
        if (!/\s/.test(nextOriginalChar) && !isPunctuation(nextOriginalChar) &&
            !isUserSpace && !isUserPunct &&
            nextOriginalChar.toLowerCase() === userChar.toLowerCase()) {
          isDeletionCandidate = true;
          break;
        }
      }
    } else if (originalPtr < original.length && userPtr >= user.length) {
      // 원본에 남은 문자가 있고 사용자 입력이 끝난 경우, 남은 원본 문자는 삭제로 간주
      isDeletionCandidate = true;
    }

    // 삽입 후보인지 확인: 원본 문자가 사용자의 다음 문자(들)와 일치하는가?
    if (userPtr + 1 < user.length && originalPtr < original.length) {
      for (let k = 1; k <= MAX_LOOKAHEAD_CHAR && userPtr + k < user.length; k++) {
        const nextUserChar = user[userPtr + k];
        // 공백이나 구두점 아닌, 유의미한 글자로 재동기화 시도
        if (!/\s/.test(nextUserChar) && !isPunctuation(nextUserChar) &&
            !isOriginalSpace && !isOriginalPunct &&
            nextUserChar.toLowerCase() === originalChar.toLowerCase()) {
          isInsertionCandidate = true;
          break;
        }
      }
    } else if (userPtr < user.length && originalPtr >= original.length) {
      // 사용자 입력에 남은 문자가 있고 원본이 끝난 경우, 남은 사용자 문자는 삽입으로 간주
      isInsertionCandidate = true;
    }

    // 후보 판단에 따라 diff 적용
    if (isDeletionCandidate && !isInsertionCandidate) {
      // 원본 문자 삭제
      nodes.push(<span key={`del-${originalPtr}`} style={{ backgroundColor: '#fee2e2', borderRadius: '4px', padding: '0 4px' }}>{originalChar}</span>); // 삭제된 원본 문자는 빨간색
      // 공백이나 구두점이 아닌 유의미한 글자인 경우에만 에러 카운트 증가
      if (!isOriginalSpace && !isOriginalPunct) {
        errorCount++;
      }
      originalPtr++;
    } else if (isInsertionCandidate && !isDeletionCandidate) {
      // 사용자 문자 삽입
      nodes.push(<span key={`ins-${userPtr}`} style={{ backgroundColor: '#dcfce7', borderRadius: '4px', padding: '0 4px' }}>{userChar}</span>); // 삽입된 사용자 문자는 연두색
      // 공백이나 구두점이 아닌 유의미한 글자인 경우에만 에러 카운트 증가
      if (!isUserSpace && !isUserPunct) {
        errorCount++;
      }
      userPtr++;
    } else {
      // 대체(substitution) 또는 더 복잡한 불일치 (양쪽 모두 후보이거나 모두 아닌 경우)
      // 이 경우, 두 문자열 모두에서 현재 문자를 소비
      if (originalPtr < original.length) {
        // 원본 문자가 유의미한 글자인데 불일치하거나, 구두점 <-> 글자 교환인 경우
        if ((!isOriginalSpace && !isOriginalPunct && originalChar.toLowerCase() !== userChar.toLowerCase()) ||
            (!isOriginalPunct && isUserPunct) || // 원본이 글자, 사용자가 구두점
            (isOriginalPunct && !isUserPunct)) { // 원본이 구두점, 사용자가 글자
          nodes.push(<span key={`sub-orig-${originalPtr}`} style={{ backgroundColor: '#fee2e2', borderRadius: '4px', padding: '0 4px' }}>{originalChar}</span>);
          // 에러 카운트는 원본이 유의미한 글자일 때만 증가 (구두점 -> 글자 교환 포함)
          if (!isOriginalPunct || (!isOriginalPunct && isUserPunct)) { // 이 조건은 단순화 가능
              errorCount++;
          }
        } else {
          // 일치하는 경우 (구두점끼리 일치 또는 이미 위에서 처리된 문자) 또는 구두점만 다른 경우
          nodes.push(originalChar);
        }
        originalPtr++;
      }

      if (userPtr < user.length) {
        // 사용자 문자가 유의미한 글자인데 불일치하거나, 글자 -> 구두점 교환인 경우
        if ((!isUserSpace && !isUserPunct && originalChar.toLowerCase() !== userChar.toLowerCase()) ||
            (!isUserPunct && isOriginalPunct) || // 사용자가 글자, 원본이 구두점
            (isUserPunct && !isOriginalPunct)) { // 사용자가 구두점, 원본이 글자
          nodes.push(<span key={`sub-user-${userPtr}`} style={{ backgroundColor: '#dcfce7', borderRadius: '4px', padding: '0 4px' }}>{userChar}</span>);
          // 에러 카운트는 사용자가 유의미한 글자일 때만 증가 (글자 -> 구두점 교환 포함)
          if (!isUserPunct || (!isUserPunct && isOriginalPunct)) { // 이 조건은 단순화 가능
             // 이미 originalPtr 쪽에서 카운트했으므로 여기서는 중복 방지
             // 만약 originalChar가 없고 userChar만 있다면 (끝까지 왔는데 남은 경우)
             if (originalPtr >= original.length && !isUserSpace && !isUserPunct) {
                errorCount++;
             }
          }
        } else {
          // 일치하는 경우 (구두점끼리 일치 또는 이미 위에서 처리된 문자) 또는 구두점만 다른 경우
          nodes.push(userChar);
        }
        userPtr++;
      }
    }
  }

  return { nodes, errorCount };
};

// Verse ID를 기준으로 정렬하는 비교 함수
const sortVersesById = (a: Verse, b: Verse) => {
  // 그룹 (A, B, C, D, E)을 추출하여 비교
  const groupA = a.id.split('-')[0];
  const groupB = b.id.split('-')[0];

  if (groupA < groupB) return -1;
  if (groupA > groupB) return 1;

  // 그룹이 같으면 숫자 부분을 추출하여 비교
  const numA = parseInt(a.id.split('-')[1]);
  const numB = parseInt(b.id.split('-')[1]);
  return numA - numB;
};


// App 컴포넌트 정의
const App: React.FC = () => {
  const [mode, setMode] = useState<'PLTC' | 'LTC' | 'SPECIFIC'>('PLTC'); // 'SPECIFIC' 모드 추가
  const [practiceMode, setPracticeMode] = useState(true); // 연습 모드 (true) 또는 실전 모드 (false)
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [userInputAddress, setUserInputAddress] = useState('');
  const [userInputText, setUserInputText] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrectAddress, setIsCorrectAddress] = useState(false);
  const [isCorrectText, setIsCorrectText] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<React.ReactNode | string>('');
  const [errorCharCount, setErrorCharCount] = useState(0); // 틀린 글자 수 상태 추가
  const [needsPracticeVerses, setNeedsPracticeVerses] = useState<Verse[]>([]);
  const [currentPracticeVerses, setCurrentPracticeVerses] = useState<Verse[]>([]);
  const [testResults, setTestResults] = useState<{ id: string; correct: boolean; diff: (string | React.ReactNode)[] }[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedSpecificVerses, setSelectedSpecificVerses] = useState<string[]>([]); // 특정 구절 선택을 위한 상태

  const addressInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  // 선택된 모드(PLTC/LTC/SPECIFIC)에 따라 구절을 필터링합니다.
  const getVersesForMode = useCallback(() => {
    if (mode === 'PLTC') {
      return allVerses.filter(verse => verse.group === 'A' || verse.group === 'B');
    } else if (mode === 'LTC') {
      return allVerses;
    } else if (mode === 'SPECIFIC') {
      // 선택된 특정 구절만 반환
      return allVerses.filter(verse => selectedSpecificVerses.includes(verse.id));
    }
    return []; // 기본값
  }, [mode, selectedSpecificVerses]);

  // 연습 구절을 초기화하거나 실전 모드를 위해 랜덤 구절을 생성합니다.
  useEffect(() => {
    // 모드 변경 시 항상 초기화
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
        // 실전 모드를 위해 10개의 랜덤 구절을 선택한 후 ID 순으로 정렬
        const shuffledVerses = [...verses].sort(() => 0.5 - Math.random());
        const selectedAndSortedVerses = shuffledVerses.slice(0, 10).sort(sortVersesById);
        setCurrentPracticeVerses(selectedAndSortedVerses);
      }
    } else {
      // SPECIFIC 모드일 때는 getVersesForMode가 selectedSpecificVerses에 의존하므로,
      // '테스트 시작' 버튼을 통해 currentPracticeVerses를 설정합니다.
      setCurrentPracticeVerses([]);
    }
  }, [mode, practiceMode, getVersesForMode]);

  // 입력 필드와 피드백을 초기화하는 헬퍼 함수입니다.
  const resetInputs = () => {
    setUserInputAddress('');
    setUserInputText('');
    setShowAnswer(false);
    setIsCorrectAddress(false);
    setIsCorrectText(false);
    setFeedbackMessage('');
    setErrorCharCount(0); // 틀린 글자 수 초기화
    addressInputRef.current?.focus();
  };

  // 특정 구절 선택 핸들러
  const handleToggleSpecificVerse = (verseId: string) => {
    setSelectedSpecificVerses(prev =>
      prev.includes(verseId)
        ? prev.filter(id => id !== verseId)
        : [...prev, verseId].sort() // 오름차순 정렬
    );
  };

  // 특정 구절 모드에서 테스트 시작 버튼 핸들러
  const handleStartSpecificTest = () => {
    if (selectedSpecificVerses.length === 0) {
      alert('테스트할 구절을 하나 이상 선택해주세요.'); // 사용자에게 알림
      return;
    }
    const versesToTest = allVerses.filter(verse => selectedSpecificVerses.includes(verse.id)).sort(sortVersesById); // 선택된 구절도 정렬
    setCurrentPracticeVerses(versesToTest);
    setCurrentVerseIndex(0);
    setTestResults([]);
    setShowSummary(false);
    resetInputs();
  };


  // "완료" 버튼 클릭을 처리합니다.
  const handleComplete = () => {
    if (currentPracticeVerses.length === 0) return;

    const currentVerse = currentPracticeVerses[currentVerseIndex];
    const normalizedCorrectAddress = normalizeAddress(currentVerse.address);
    const normalizedUserAddress = normalizeAddress(userInputAddress);
    // const normalizedCorrectText = normalizeText(currentVerse.text); // 사용 안 함
    // const normalizedUserText = normalizeText(userInputText); // 사용 안 함

    const addressMatch = normalizedCorrectAddress === normalizedUserAddress;
    // 띄어쓰기를 무시하고 텍스트 내용만 비교 (구두점도 무시)
    const contentCorrectText = currentVerse.text.replace(/[\s.,!?;:"'‘’“”`()\[\]{}<>\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F\uFF00-\uFFEF~!@#$%^&*+-=|\\/`_]/gu, '').toLowerCase();
    const contentUserText = userInputText.replace(/[\s.,!?;:"'‘’“”`()\[\]{}<>\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F\uFF00-\uFFEF~!@#$%^&*+-=|\\/`_]/gu, '').toLowerCase();
    const textContentMatch = contentCorrectText === contentUserText;


    setIsCorrectAddress(addressMatch);
    setIsCorrectText(textContentMatch); // 내용 일치 여부로 설정
    setShowAnswer(true);

    if (textContentMatch && addressMatch) {
      setFeedbackMessage('정답과 일치합니다.');
      setErrorCharCount(0); // 틀린 글자 수 0
      // 연습 모드에서 정답인 경우, 연습 필요 구절 목록에서 제거합니다.
      if (practiceMode && mode !== 'SPECIFIC') { // 특정 구절 모드에서는 '연습 필요' 기능 없음
        setNeedsPracticeVerses(prev => prev.filter(v => v.id !== currentVerse.id));
      }
    } else {
      const { nodes: textDiffNodes, errorCount: diffErrorCount } = getDiff(currentVerse.text, userInputText);
      setFeedbackMessage(
        <>
          <p>주소: {addressMatch ? '일치' : <span style={{ color: '#ef4444', fontWeight: 'bold' }}>오류 (정답: {currentVerse.address})</span>}</p>
          <p style={{ marginTop: '0.5rem' }}>본문:</p>
          <div style={{ backgroundColor: '#f3f4f6', padding: '0.5rem', borderRadius: '0.375rem', fontFamily: 'monospace', fontSize: '0.875rem', textAlign: 'left' }}>{textDiffNodes}</div>
          <p style={{ marginTop: '1rem', fontWeight: 'bold', color: '#dc2626' }}>틀린 글자 수: {diffErrorCount}</p> {/* 틀린 글자 수 표시 */}
        </>
      );
      setErrorCharCount(diffErrorCount); // 틀린 글자 수 업데이트

      // 정답이 아닌 경우, 연습 모드에서 연습 필요 구절 목록에 추가합니다.
      if (practiceMode && mode !== 'SPECIFIC' && !needsPracticeVerses.some(v => v.id === currentVerse.id)) { // 특정 구절 모드에서는 '연습 필요' 기능 없음
        setNeedsPracticeVerses(prev => [...prev, currentVerse]);
      }
    }

    // 실전 모드를 위한 결과 기록 (SPECIFIC 모드도 결과 기록)
    if (!practiceMode || mode === 'SPECIFIC') {
      setTestResults(prev => [...prev, { id: currentVerse.id, correct: (addressMatch && textContentMatch), diff: textContentMatch ? [] : getDiff(currentVerse.text, userInputText).nodes }]);
    }
  };

  // "연습 필요" 버튼 클릭을 처리합니다. (특정 구절 모드에서는 사용 안 함)
  const handleNeedsPractice = () => {
    if (currentPracticeVerses.length === 0 || mode === 'SPECIFIC') return;

    const currentVerse = currentPracticeVerses[currentVerseIndex];
    if (practiceMode && !needsPracticeVerses.some(v => v.id === currentVerse.id)) {
      setNeedsPracticeVerses(prev => [...prev, currentVerse]);
    }
    moveToNextVerse();
  };

  // "암송 완료" 버튼 클릭을 처리합니다. (특정 구절 모드에서는 사용 안 함)
  const handleRecitationComplete = () => {
    if (currentPracticeVerses.length === 0 || mode === 'SPECIFIC') return;

    const currentVerse = currentPracticeVerses[currentVerseIndex];
    // 연습 필요 구절 목록에서 제거합니다.
    setNeedsPracticeVerses(prev => prev.filter(v => v.id !== currentVerse.id));
    moveToNextVerse();
  };

  // 현재 연습 세트의 다음 구절로 이동합니다.
  const moveToNextVerse = () => {
    resetInputs();
    if (currentVerseIndex < currentPracticeVerses.length - 1) {
      setCurrentVerseIndex(prev => prev + 1);
    } else {
      // 현재 라운드 종료
      if (practiceMode && mode !== 'SPECIFIC') {
        // 연습 모드이고 연습 필요한 구절이 남아있다면, 새로운 라운드를 시작합니다.
        if (needsPracticeVerses.length > 0) {
          setCurrentPracticeVerses(needsPracticeVerses); // 현재 연습 구절을 연습 필요한 구절로 재설정합니다.
          setNeedsPracticeVerses([]); // 새로운 라운드를 위해 연습 필요한 목록을 지웁니다.
          setCurrentVerseIndex(0); // 새로운 연습 세트의 시작으로 이동합니다.
        } else {
          // 연습 모드의 모든 구절이 암송되었습니다.
          setShowSummary(true);
        }
      } else {
        // 실전 모드 또는 특정 구절 모드 종료
        setShowSummary(true);
      }
    }
  };

  const handleReset = () => {
    // 모든 모드에서 초기화
    setSelectedSpecificVerses([]); // 특정 구절 선택 초기화
    setMode('PLTC'); // 기본 모드로 돌아가기
    setPracticeMode(true); // 연습 모드로 돌아가기
    setCurrentPracticeVerses(getVersesForMode()); // PLTC 연습 모드의 구절로 초기화
    setCurrentVerseIndex(0);
    setNeedsPracticeVerses([]);
    setTestResults([]);
    setShowSummary(false);
    resetInputs();
  };

  const currentVerse = currentPracticeVerses[currentVerseIndex];

  return (
    <div style={styles.appContainer}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>주제별 성경 암송</h1>
        <div style={styles.headerButtonContainer}>
          <button
            onClick={() => { setMode('PLTC'); setPracticeMode(true); }} // 모드 변경 시 연습 모드로 자동 설정
            className={`header-button ${mode === 'PLTC' ? 'active' : 'inactive'}`}
          >
            PLTC
          </button>
          <button
            onClick={() => { setMode('LTC'); setPracticeMode(true); }} // 모드 변경 시 연습 모드로 자동 설정
            className={`header-button ${mode === 'LTC' ? 'active' : 'inactive'}`}
          >
            LTC
          </button>
          <button
            onClick={() => setMode('SPECIFIC')} // 특정 구절 모드 버튼
            className={`header-button ${mode === 'SPECIFIC' ? 'active' : 'inactive'}`}
          >
            특정 구절
          </button>
        </div>
        {/* 초기화 버튼을 우측 상단으로 이동 */}
        <div style={styles.resetButtonWrapper}>
            <button
                onClick={handleReset}
                className="action-button reset"
            >
                초기화
            </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={styles.mainContent}>
        {mode !== 'SPECIFIC' && ( // 특정 구절 모드가 아닐 때만 연습/실전 모드 버튼 표시
          <div style={styles.modeSelectionContainer}>
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
          // 특정 구절 선택 UI
          <div style={styles.specificVerseSelectionContainer}>
            <h2 style={styles.specificVerseSelectionTitle}>테스트할 구절 선택</h2>
            <div style={styles.verseGrid}>
              {allVerses.map(verse => (
                <div key={verse.id} style={styles.verseSelectItem} className="verse-select-item"> {/* className 추가 */}
                  <input
                    type="checkbox"
                    id={`verse-${verse.id}`}
                    checked={selectedSpecificVerses.includes(verse.id)}
                    onChange={() => handleToggleSpecificVerse(verse.id)}
                    style={styles.checkbox}
                  />
                  <label htmlFor={`verse-${verse.id}`} style={styles.verseLabel}>
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
              테스트 시작
            </button>
          </div>
        ) : showSummary ? (
          <div style={styles.summaryContainer}>
            <h2 style={styles.summaryTitle}>테스트 결과 요약</h2>
            {testResults.map((result, index) => (
              <div key={index} style={styles.summaryItem}>
                <p style={styles.summaryItemTitle}>{result.id}: {result.correct ? <span style={{ color: '#10b981' }}>정답</span> : <span style={{ color: '#ef4444' }}>오답</span>}</p>
                {!result.correct && result.diff.length > 0 && (
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
              {/* 현재 구절 ID */}
              <div style={styles.currentVerseId}>
                <p style={styles.currentVerseIdText}>
                  <span style={styles.currentVerseIdNumber}>{currentVerse.id}</span>
                  {` (${currentVerseIndex + 1}/${currentPracticeVerses.length})`}
                </p>
              </div>

              {/* 입력 필드 */}
              <div style={styles.inputGroup}>
                <label htmlFor="address" style={styles.inputLabel}>주소</label>
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

              <div style={styles.inputGroup}>
                <label htmlFor="text" style={styles.inputLabel}>본문</label>
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

              {/* 액션 버튼 */}
              <div style={styles.actionButtonContainer}>
                <button
                  onClick={handleComplete}
                  className="action-button complete"
                >
                  완료
                </button>
              </div>

              {/* 피드백 섹션 */}
              {showAnswer && (
                <div style={styles.feedbackSection}>
                  <h3 style={styles.feedbackTitle}>정답</h3>
                  <div style={styles.feedbackVerseInfo}>
                    <p style={styles.feedbackAddress}>주소: <span style={{ color: isCorrectAddress ? '#10b981' : '#ef4444' }}>{currentVerse.address}</span></p>
                    <p style={styles.feedbackTextLabel}>본문:</p>
                    {/* feedbackCorrectText 스타일 적용을 위해 className 추가 */}
                    <p style={styles.feedbackCorrectText} className="feedback-correct-text">{currentVerse.text}</p>
                  </div>
                  {feedbackMessage && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      fontWeight: '600',
                      backgroundColor: (isCorrectText && isCorrectAddress) ? '#d1fae5' : '#fee2e2', /* bg-green-100 / bg-red-100 */
                      color: (isCorrectText && isCorrectAddress) ? '#065f46' : '#991b1b', /* text-green-700 / text-red-700 */
                    }}>
                      {feedbackMessage}
                    </div>
                  )}

                  {/* '특정 구절' 모드에서는 '연습 필요', '암송 완료' 버튼을 숨깁니다. */}
                  {mode !== 'SPECIFIC' && (
                    <div style={styles.practiceButtonContainer}>
                      <button
                        onClick={handleNeedsPractice}
                        className="action-button practice-needed"
                      >
                        연습 필요
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
            <div style={styles.noVerseMessage}>
              선택된 모드에 해당하는 구절이 없습니다.
            </div>
          )
        )}
      </main>
    </div>
  );
};

// CSS-in-JS 스타일
const styles = {
  appContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    padding: '1rem',
  },
  header: {
    position: 'relative' as 'relative',
    width: '100%',
    maxWidth: '960px', // max-w-4xl (약 960px)
    backgroundColor: 'white',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-md
    borderRadius: '0.75rem', // rounded-xl
    padding: '1.5rem', // p-6
    marginBottom: '2rem', // mb-8
    display: 'flex',
    flexDirection: 'column' as 'column', // flex-col
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '2rem', // text-3xl
    fontWeight: 'bold',
    color: '#374151', // text-gray-800
    marginBottom: '1rem', // mb-4
  },
  headerButtonContainer: {
    display: 'flex',
    gap: '1rem', // space-x-4
  },
  // 초기화 버튼을 위한 새로운 스타일
  resetButtonWrapper: {
    position: 'absolute' as 'absolute',
    top: '1.5rem', // 헤더 상단에서 24px
    right: '1.5rem', // 헤더 우측에서 24px
    zIndex: 10, // 다른 요소 위에 오도록 z-index 설정
  },
  mainContent: {
    width: '100%',
    maxWidth: '960px', // max-w-4xl
    backgroundColor: 'white',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-md
    borderRadius: '0.75rem', // rounded-xl
    padding: '2rem', // p-8
  },
  modeSelectionContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem', // space-x-6
    marginBottom: '2rem', // mb-8
  },
  currentVerseId: {
    textAlign: 'center' as 'center',
    marginBottom: '1.5rem', // mb-6
  },
  currentVerseIdText: {
    fontSize: '1.125rem', // text-xl
    fontWeight: '600', // font-semibold
    color: '#4b5563', // text-gray-600
  },
  currentVerseIdNumber: {
    color: '#2563eb', // text-blue-600
    fontSize: '1.25rem', // text-2xl
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: '1.5rem', // mb-6
  },
  inputLabel: {
    display: 'block',
    fontSize: '1.125rem', // text-lg
    fontWeight: '500', // font-medium
    color: '#374151', // text-gray-700
    marginBottom: '0.5rem', // mb-2
  },
  actionButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem', // space-x-4
    marginBottom: '1.5rem', // mb-6
  },
  feedbackSection: {
    marginTop: '2rem', // mt-8
    padding: '1.5rem', // p-6
    backgroundColor: '#eff6ff', // bg-blue-50
    borderRadius: '0.75rem', // rounded-xl
    border: '1px solid #bfdbfe', // border-blue-200
    boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)', // shadow-inner
  },
  feedbackTitle: {
    fontSize: '1.25rem', // text-xl
    fontWeight: 'bold',
    color: '#1e40af', // text-blue-800
    marginBottom: '1rem', // mb-4
  },
  feedbackVerseInfo: {
    marginBottom: '1rem', // mb-4
  },
  feedbackAddress: {
    fontWeight: '600', // font-semibold
  },
  feedbackTextLabel: {
    fontWeight: '600', // font-semibold
    marginTop: '0.5rem', // mt-2
  },
  feedbackCorrectText: {
    backgroundColor: 'white',
    padding: '0.75rem', // p-3
    borderRadius: '0.375rem', // rounded-md
    border: '1px solid #e5e7eb', // border-gray-200
    color: '#374151', // text-gray-800
    whiteSpace: 'pre-wrap', // preserves whitespace and line breaks
  },
  practiceButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem', // space-x-4
    marginTop: '1.5rem', // mt-6
  },
  summaryContainer: {
    textAlign: 'center' as 'center',
  },
  summaryTitle: {
    fontSize: '1.5rem', // text-2xl
    fontWeight: 'bold',
    marginBottom: '1rem', // mb-4
  },
  summaryItem: {
    marginBottom: '1rem', // mb-4
    padding: '1rem', // p-4
    border: '1px solid #e5e7eb', // border border-gray-200
    borderRadius: '0.375rem', // rounded-md
  },
  summaryItemTitle: {
    fontSize: '1.125rem', // text-lg
    fontWeight: '600', // font-semibold
  },
  noVerseMessage: {
    textAlign: 'center' as 'center',
    fontSize: '1.25rem', // text-xl
    color: '#4b5563', // text-gray-600
  },
  // 특정 구절 선택 UI 스타일
  specificVerseSelectionContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    padding: '2rem',
    backgroundColor: '#f9fafb', // bg-gray-50
    borderRadius: '0.75rem',
    boxShadow: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  specificVerseSelectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    color: '#1f2937', // text-gray-900
  },
  verseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', // 반응형 그리드
    gap: '0.75rem', // gap-3
    width: '100%',
    maxWidth: '800px', // 그리드 최대 너비
    marginBottom: '1.5rem',
    maxHeight: '400px', // 스크롤바를 위한 최대 높이
    overflowY: 'auto' as 'auto', // 스크롤바 추가
    paddingRight: '1rem', // 스크롤바 공간 확보
  },
  // verseSelectItem은 App.css로 호버 스타일을 분리하고, 나머지 스타일은 여기에 유지
  verseSelectItem: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.5rem', // rounded-md
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm
    border: '1px solid #e5e7eb', // border-gray-200
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  checkbox: {
    marginRight: '0.5rem', // mr-2
    width: '16px',
    height: '16px',
    accentColor: '#2563eb', // 파란색 체크박스
  },
  verseLabel: {
    fontSize: '0.875rem', // text-sm
    fontWeight: '500', // font-medium
    color: '#374151', // text-gray-800
    cursor: 'pointer',
  },
};

export default App;

import { useState, useEffect } from 'react';
import './App.css';

// ==========================================
// 1. API 데이터 매핑 (API 응답 규격 기반 Mock Data)
// ==========================================
const API_PRODUCTS = [
  {
    id: 1,
    key: 'ottomar',
    name: "Ottomar 비세토스 위켄더",
    shortDescription: "MCM의 여행용 캐리어 헤리티지와 시그니처 비세토스를 담은 대표 웨컨더백",
    img: '/p2_image1_2.png',
    tags: ["VISETOS", "COGNAC_Color", "MOBILITY", "GeoMetric_Structure"]
  },
  {
    id: 2,
    key: 'stark',
    name: "Stark 사이드 비세토스 백팩",
    shortDescription: "블랙 비세토스와 피라미드 스터드로 도시적 이동성과 대담한 자기표현을 담은 MCM의 대표 백팩",
    img: '/p2_image2_2.png',
    tags: ["Visetos", "Mobility", "Visible_Identity", "Metal Studs"]
  },
  {
    id: 3,
    key: 'wethebest',
    name: "SMCM X We The Best 비세토스 크로스바디 파우치",
    shortDescription: "코냑 비세토스에 선명한 마이애미 블루와 음악 문화를 결합해 MCM 헤리티지를 자유롭게 재해석한 협업 파우치",
    img: '/p2_image3_2.png',
    tags: ["Visetos", "Miami_Blue", "Adaptive_Styling", "Cultural_Collaboration"]
  }
];

const API_DNA_MAP = {
  1: [
    { id: 1, name: "VISETOS", ratio: 34, desc: "MCM을 즉시 인식하게 하는 시그니처 모노그램" },
    { id: 2, name: "COGNAC COLOR", ratio: 28, desc: "브랜드 헤리티지를 보여주는 따뜻한 코냑 색감" },
    { id: 3, name: "MOBILITY", ratio: 23, desc: "여행과 이동이라는 MCM의 본질적인 가치" },
    { id: 4, name: "VISIBLE IDENTITY", ratio: 15, desc: "트렁크에서 이어지는 입체적이고 기하학적인 형태" }
  ],
  2: [
    { id: 1, name: "Visetos Pattern", ratio: 34, desc: "블랙 톤으로 재해석된 시그니처 모노그램 정체성" },
    { id: 2, name: "Visible Identity", ratio: 28, desc: "반복되는 로고 패턴과 대담한 자기표현 가치" },
    { id: 3, name: "Metal Studs", ratio: 23, desc: "측면의 피라미드 스터드가 전하는 강렬한 이미지" },
    { id: 4, name: "Mobility", ratio: 15, desc: "양손을 자유롭게 하는 백팩 구조의 도시 이동성" }
  ],
  3: [
    { id: 1, name: "Visetos", ratio: 35, desc: "클래식 비세토스 모노그램 패턴의 아이덴티티" },
    { id: 2, name: "Cultural Collab", ratio: 30, desc: "음악 및 스트리트 문화와의 혁신적 컬래버레이션" },
    { id: 3, name: "Miami Blue", ratio: 20, desc: "선명하고 에너제틱한 마이애미 블루 비주얼 Accent" },
    { id: 4, name: "Adaptive Styling", ratio: 15, desc: "크로스바디를 넘나드는 유연하고 실용적인 스타일" }
  ]
};

const API_FUTURE_CONTEXTS = [
  { id: 1, key: 'space', name: "Space Travel", description: "무중력 이동과 행성 간 여행을 위한 미래 환경", icon: "🚀" },
  { id: 2, key: 'city', name: "Hyper City", description: "초고밀도 도시의 빠른 이동과 스마트한 보안 환경", icon: "🏙️" },
  { id: 3, key: 'climate', name: "Climate Adaptation", description: "극한 기후에 대응하는 자가 보호형 소재 환경", icon: "🌧️" },
  { id: 4, key: 'virtual', name: "Virtual Dimension", description: "현실과 디지털 정체성이 연결된 융합 공간", icon: "🔮" }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [currentTime, setCurrentTime] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // 선택 상태값들 (API ID 기준)
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedDnaIds, setSelectedDnaIds] = useState([]);
  const [selectedContextId, setSelectedContextId] = useState(null);

  // 애니메이션용 DNA 진행률
  const [dnaProgressValues, setDnaProgressValues] = useState([]);

  // 실시간 시계
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const goToScreen = (screenNum) => {
    setCurrentScreen(screenNum);

    // 3번 화면 이동 시 DNA 애니메이션 트리거
    if (screenNum === 3 && selectedProductId) {
      const list = API_DNA_MAP[selectedProductId] || [];
      setDnaProgressValues(list.map(() => 0));

      setTimeout(() => {
        setDnaProgressValues(list.map((item) => item.ratio));
      }, 150);
    }
  };

  const toggleDnaLock = (id) => {
    if (selectedDnaIds.includes(id)) {
      setSelectedDnaIds(selectedDnaIds.filter((item) => item !== id));
    } else {
      if (selectedDnaIds.length >= 2) {
        triggerToast('최대 2개까지 선택할 수 있습니다.');
        return;
      }
      setSelectedDnaIds([...selectedDnaIds, id]);
    }
  };

  // 백엔드 API 규격에 맞춘 생성 요청 POST 처리
  const handleGenerate = async () => {
    const requestPayload = {
      archiveProductId: selectedProductId,
      lockedDnaIds: selectedDnaIds,
      futureContextId: selectedContextId
    };

    console.log('API Request Body:', requestPayload);

    // 실제 백엔드 연동 시 fetch 사용 예시:
    /*
    const res = await fetch('/api/v1/portal/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });
    const result = await res.json();
    */

    const selectedProduct = API_PRODUCTS.find(p => p.id === selectedProductId);
    const selectedEnv = API_FUTURE_CONTEXTS.find(e => e.id === selectedContextId);

    alert(
      `[생성 요청 API 완료]\n- archiveProductId: ${requestPayload.archiveProductId} (${selectedProduct?.name})\n- lockedDnaIds: [${requestPayload.lockedDnaIds.join(', ')}]\n- futureContextId: ${requestPayload.futureContextId} (${selectedEnv?.name})\n\nAI 생성 요청이 등록되었습니다. (status: GENERATING)`
    );
  };

  const currentProduct = API_PRODUCTS.find((p) => p.id === selectedProductId);
  const currentDnaList = selectedProductId ? API_DNA_MAP[selectedProductId] : [];

  return (
    <div className="app-container">
      {/* 미리보기 모달 */}
      <div className={`modal-overlay ${isPreviewModalOpen ? 'active' : ''}`}>
        <div className="modal-card">
          <div className="modal-title">서비스 미리보기</div>
          <div className="modal-desc">
            MCM TIME PORTAL 2076은 브랜드의 헤리티지와 미래 환경을 조합하여 100년 뒤의 MCM 대표 제품을 직접 설계해보는 인터랙티브 서비스입니다.
          </div>
          <button className="modal-close-btn" onClick={() => setIsPreviewModalOpen(false)}>
            확인
          </button>
        </div>
      </div>

      {/* 토스트 메시지 */}
      <div className={`toast-msg ${showToast ? 'show' : ''}`}>{toastMessage}</div>

      {/* SCREEN 1: Onboarding */}
      <div className={`screen ${currentScreen === 1 ? 'active' : ''}`} id="screen1">
        <header className="top-header">
          <div className="header-left">
            <span className="num-badge">01</span>
            <span className="header-title">Onboarding</span>
          </div>
          <div className="header-right">
            <span>{currentTime}</span> ···
          </div>
        </header>

        <div className="mcm-logo-box">
          <img src="/mcm_logo.png" alt="MCM Logo" onError={(e) => (e.target.src = 'https://via.placeholder.com/100?text=MCM')} />
        </div>
        <div className="home-hero">
          <div className="home-sub">FROM HERITAGE TO THE NEXT CENTURY</div>
          <h1 className="home-title">MCM TIME PORTAL 2076</h1>
          <p className="home-desc">
            MCM의 과거를 선택하고<br />다음 세기의 제품을 직접 설계하세요.
          </p>
        </div>
        <div style={{ width: '100%', maxWidth: '600px', marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button className="btn-primary" onClick={() => goToScreen(2)}>
            TIME PORTAL ENTER
          </button>
          <button className="btn-secondary" onClick={() => setIsPreviewModalOpen(true)}>
            서비스 미리보기
          </button>
        </div>
      </div>

      {/* SCREEN 2: Archive Select */}
      <div className={`screen ${currentScreen === 2 ? 'active' : ''}`} id="screen2">
        <header className="top-header">
          <div className="header-left">
            <span className="num-badge">02</span>
            <span className="header-title">Archive Select</span>
          </div>
          <div className="header-right">
            <span>{currentTime}</span> ···
          </div>
        </header>

        <div className="progress-bar-wrap">
          <div className="progress-step active"></div>
          <div className="progress-step"></div>
          <div className="progress-step"></div>
          <div className="progress-step"></div>
        </div>

        <button className="btn-back-link" onClick={() => goToScreen(1)}>
          ← 이전 단계
        </button>

        <div>
          <div className="sub-caption">ARCHIVE 1976–2026</div>
          <h1 className="page-title">어떤 MCM에서 시작할까요?</h1>
          <p className="page-desc">미래로 번역할 아카이브 제품을 선택해주세요.</p>
        </div>

        <div className="product-list">
          {API_PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              className={`product-card ${selectedProductId === prod.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedProductId(prod.id);
                setSelectedDnaIds([]); // 제품이 바뀌면 선택된 DNA 초기화
              }}
            >
              <div className="card-img-wrap">
                <img src={prod.img} alt={prod.name} onError={(e) => (e.target.src = 'https://via.placeholder.com/90?text=MCM')} />
              </div>
              <div className="card-info">
                <div className="card-title">{prod.name}</div>
                <div className="card-desc">{prod.shortDescription}</div>
                <div className="tag-group">
                  {prod.tags.slice(0, 2).map((tag, i) => (
                    <span className="tag" key={i}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="btn-primary" disabled={!selectedProductId} onClick={() => goToScreen(3)}>
          이 제품으로 시작하기
        </button>
      </div>

      {/* SCREEN 3: DNA Decode */}
      <div className={`screen ${currentScreen === 3 ? 'active' : ''}`} id="screen3">
        <header className="top-header">
          <div className="header-left">
            <span className="num-badge">03</span>
            <span className="header-title">DNA Decode</span>
          </div>
          <div className="header-right">
            <span>{currentTime}</span> ···
          </div>
        </header>

        <div className="progress-bar-wrap">
          <div className="progress-step active"></div>
          <div className="progress-step active"></div>
          <div className="progress-step"></div>
          <div className="progress-step"></div>
        </div>

        <button className="btn-back-link" onClick={() => goToScreen(2)}>
          ← 이전 단계
        </button>

        <div>
          <div className="sub-caption">HERITAGE ANALYSIS</div>
          <h1 className="page-title">이 제품의 DNA를 분해해볼게요</h1>
          <p className="page-desc">MCM을 MCM답게 만드는 시각적·기능적 요소를 보여줍니다.</p>
        </div>

        {currentProduct && (
          <>
            <div className="product-display-card">
              <div className="display-img-box">
                <img src={currentProduct.img} alt={currentProduct.name} />
              </div>
              <div className="display-title">{currentProduct.name}</div>
            </div>

            <div className="dna-stats-container">
              {currentDnaList.map((item, idx) => (
                <div className="dna-stat-item" key={item.id}>
                  <div className="dna-label-row">
                    <span style={{ color: 'var(--text-main)' }}>{item.name}</span>
                    <span style={{ color: 'var(--primary-blue)' }}>{dnaProgressValues[idx] || 0}%</span>
                  </div>
                  <div className="dna-bar-bg">
                    <div className="dna-bar-fill" style={{ width: `${dnaProgressValues[idx] || 0}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <button className="btn-primary" onClick={() => goToScreen(4)}>
          Heritage Lock 설정하기
        </button>
      </div>

      {/* SCREEN 4: Heritage Lock */}
      <div className={`screen ${currentScreen === 4 ? 'active' : ''}`} id="screen4">
        <header className="top-header">
          <div className="header-left">
            <span className="num-badge">04</span>
            <span className="header-title">Heritage Lock</span>
          </div>
          <div className="header-right">
            <span>{currentTime}</span> ···
          </div>
        </header>

        <div className="progress-bar-wrap">
          <div className="progress-step active"></div>
          <div className="progress-step active"></div>
          <div className="progress-step active"></div>
          <div className="progress-step"></div>
        </div>

        <button className="btn-back-link" onClick={() => goToScreen(3)}>
          ← 이전 단계
        </button>

        <div>
          <div className="sub-caption">KEEP THE IDENTITY</div>
          <h1 className="page-title">100년 뒤에도 남길 MCM DNA를 골라주세요</h1>
          <p className="page-desc">최소 1개가 미래 제품에 반드시 유지됩니다.</p>
        </div>

        <div className="dna-grid">
          {currentDnaList.map((item) => {
            const isSelected = selectedDnaIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={`dna-lock-card ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleDnaLock(item.id)}
              >
                <div className="dna-card-header">
                  <div className="dna-card-title">{item.name}</div>
                  <span className="locked-badge">LOCKED</span>
                </div>
                <div className="dna-card-desc">{item.desc}</div>
              </div>
            );
          })}
        </div>

        <div className="locked-summary-box">
          <div>Locked DNA</div>
          <div className="summary-tag-wrap">
            {selectedDnaIds.length === 0
              ? '선택된 DNA가 없습니다.'
              : selectedDnaIds
                  .map((id) => currentDnaList.find((d) => d.id === id)?.name)
                  .join(' · ')}
          </div>
        </div>

        <button className="btn-primary" disabled={selectedDnaIds.length === 0} onClick={() => goToScreen(5)}>
          미래 환경 선택하기
        </button>
      </div>

      {/* SCREEN 5: Environment Select */}
      <div className={`screen ${currentScreen === 5 ? 'active' : ''}`} id="screen5">
        <header className="top-header">
          <div className="header-left">
            <span className="num-badge">05</span>
            <span className="header-title">Environment Select</span>
          </div>
          <div className="header-right">
            <span>{currentTime}</span> ···
          </div>
        </header>

        <div className="progress-bar-wrap">
          <div className="progress-step active"></div>
          <div className="progress-step active"></div>
          <div className="progress-step active"></div>
          <div className="progress-step active"></div>
        </div>

        <button className="btn-back-link" onClick={() => goToScreen(4)}>
          ← 이전 단계
        </button>

        <div>
          <div className="sub-caption">WELCOME TO 2076</div>
          <h1 className="page-title">2076년, 이 제품은 어디에서 사용될까요?</h1>
          <p className="page-desc">미래 환경에 따라 기능과 소재가 자동으로 설계됩니다.</p>
        </div>

        <div className="env-list">
          {API_FUTURE_CONTEXTS.map((env) => (
            <div
              key={env.id}
              className={`env-card ${selectedContextId === env.id ? 'selected' : ''}`}
              onClick={() => setSelectedContextId(env.id)}
            >
              <div className="env-icon-wrap">{env.icon}</div>
              <div className="env-info">
                <div className="env-title">{env.name}</div>
                <div className="env-desc">{env.description}</div>
              </div>
            </div>
          ))}
        </div>

        <button className="btn-primary" disabled={!selectedContextId} onClick={handleGenerate}>
          2076년 제품 생성하기
        </button>
      </div>
    </div>
  );
}
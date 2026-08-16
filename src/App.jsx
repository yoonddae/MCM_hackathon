import { useState, useEffect } from 'react';
import './App.css';

// ⚠️ 백엔드 개발자분께 전달받은 실제 서버 주소를 넣으세요. (비어있으면 기본 데이터 사용)
const API_BASE_URL = ''; 

// API 연결 전 기본으로 보여줄 제품 Mock Data
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Ottomar 비세토스 위켄더",
    shortDescription: "MCM의 여행용 캐리어 헤리티지와 시그니처 비세토스를 담은 대표 위켄더백",
    tags: ["VISETOS", "COGNAC_Color", "MOBILITY", "GeoMetric_Structure"]
  },
  {
    id: 2,
    name: "Stark 사이드 비세토스 백팩",
    shortDescription: "블랙 비세토스와 피라미드 스터드로 도시적 이동성과 대담한 자기표현을 담은 MCM의 대표 백팩",
    tags: ["Visetos", "Mobility", "Visible_Identity", "Metal Studs"]
  },
  {
    id: 3,
    name: "SMCM X We The Best 비세토스 크로스바디 파우치",
    shortDescription: "코냑 비세토스에 선명한 마이애미 블루와 음악 문화를 결합해 MCM 헤리티지를 자유롭게 재해석한 협업 파우치",
    tags: ["Visetos", "Miami_Blue", "Adaptive_Styling", "Cultural_Collaboration"]
  }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [currentTime, setCurrentTime] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // 데이터 State
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [dnaAnalysis, setDnaAnalysis] = useState([]);
  const [heritageLocks, setHeritageLocks] = useState([]);
  const [futureContexts, setFutureContexts] = useState([]);

  // 사용자 선택 상태값
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedDnaIds, setSelectedDnaIds] = useState([]);
  const [selectedContextId, setSelectedContextId] = useState(null);

  // 로딩 및 애니메이션 State
  const [loading, setLoading] = useState(false);
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

  // 토스트 메시지
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // ==========================================
  // [API 1] 제품 목록 조회
  // ==========================================
  const fetchProducts = async () => {
    if (!API_BASE_URL) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/products`);
      const result = await res.json();
      if (result.success && result.data?.products) {
        setProducts(result.data.products);
      }
    } catch (err) {
      console.warn("API 호출 실패로 기본 데이터를 유지합니다:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // [API 2] DNA 분석 비율 조회
  // ==========================================
  const fetchDnaAnalysis = async (productId) => {
    const fallbackDna = [
      { name: "VISETOS", ratio: 34 },
      { name: "COGNAC COLOR", ratio: 28 },
      { name: "MOBILITY", ratio: 23 },
      { name: "VISIBLE IDENTITY", ratio: 15 }
    ];

    const applyProgressAnimation = (analysisData) => {
      setDnaProgressValues(analysisData.map(() => 0));
      setTimeout(() => {
        setDnaProgressValues(analysisData.map((item) => item.ratio));
      }, 200);
    };

    if (!API_BASE_URL) {
      setDnaAnalysis(fallbackDna);
      applyProgressAnimation(fallbackDna);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/products/${productId}/dna`);
      const data = await res.json();
      const analysisData = data.dnaAnalysis || fallbackDna;
      setDnaAnalysis(analysisData);
      applyProgressAnimation(analysisData);
    } catch (err) {
      console.warn("DNA API 실패, 기본 데이터 사용:", err);
      setDnaAnalysis(fallbackDna);
      applyProgressAnimation(fallbackDna);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // [API 3] Heritage Lock 옵션 조회
  // ==========================================
  const fetchHeritageLocks = async (productId) => {
    const fallbackLocks = [
      { id: 1, name: "Visetos", description: "MCM을 즉시 인식하게 하는 시그니처 모노그램" },
      { id: 2, name: "Cognac Color", description: "브랜드 헤리티지를 보여주는 따뜻한 코냑 색감" },
      { id: 3, name: "Mobility", description: "여행과 이동이라는 MCM의 본질적인 가치" },
      { id: 4, name: "Structure", description: "트렁크에서 이어지는 입체적이고 기하학적인 형태" }
    ];

    if (!API_BASE_URL) {
      setHeritageLocks(fallbackLocks);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/products/${productId}/heritage-locks`);
      const data = await res.json();
      setHeritageLocks(data.heritageLockOptions || fallbackLocks);
    } catch (err) {
      console.warn("Heritage Lock API 실패, 기본 데이터 사용:", err);
      setHeritageLocks(fallbackLocks);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // [API 4] 미래 환경 목록 조회
  // ==========================================
  const fetchFutureContexts = async () => {
    const fallbackContexts = [
      { id: 1, name: "Space Travel", description: "무중력 이동과 행성 간 여행을 위한 미래 환경" },
      { id: 2, name: "Hyper City", description: "초고밀도 도시의 빠른 이동과 스마트한 보안 환경" },
      { id: 4, name: "Virtual Dimension", description: "현실과 디지털 정체성이 연결된 융합 공간" }
    ];

    if (!API_BASE_URL) {
      setFutureContexts(fallbackContexts);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/future-contexts`);
      const data = await res.json();
      const list = data.futureContexts || fallbackContexts;
      setFutureContexts(list.filter((env) => env.id !== 3 && env.name !== "Climate Adaptation"));
    } catch (err) {
      console.warn("미래 환경 API 실패, 기본 데이터 사용:", err);
      setFutureContexts(fallbackContexts);
    } finally {
      setLoading(false);
    }
  };

  // 화면 이동 시 호출
  const goToScreen = (screenNum) => {
    setCurrentScreen(screenNum);

    if (screenNum === 2) {
      fetchProducts();
    } else if (screenNum === 3 && selectedProductId) {
      fetchDnaAnalysis(selectedProductId);
    } else if (screenNum === 4 && selectedProductId) {
      fetchHeritageLocks(selectedProductId);
    } else if (screenNum === 5) {
      fetchFutureContexts();
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

  // ==========================================
  // [API 5] POST: 최종 AI 생성 요청
  // ==========================================
  const handleGenerate = async () => {
    const requestPayload = {
      archiveProductId: selectedProductId,
      lockedDnaIds: selectedDnaIds,
      futureContextId: selectedContextId
    };

    if (!API_BASE_URL) {
      alert(`[테스트 성공]\n요청 데이터:\n${JSON.stringify(requestPayload, null, 2)}`);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });
      const result = await res.json();

      if (result.success) {
        alert(
          `[생성 요청 성공]\nGeneration ID: ${result.data.generationId}\nStatus: ${result.data.status}`
        );
      }
    } catch (err) {
      console.error("생성 요청 실패:", err);
      alert("생성 요청 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const currentProduct = products.find((p) => p.id === selectedProductId);

  const getEnvIcon = (env) => {
    const icons = { 1: "🚀", 2: "🏙️", 4: "🔮" };
    if (icons[env.id]) return icons[env.id];
    
    const nameLower = (env.name || '').toLowerCase();
    if (nameLower.includes('space')) return "🚀";
    if (nameLower.includes('city')) return "🏙️";
    if (nameLower.includes('virtual')) return "🔮";
    return "✨";
  };

  return (
    <div className="app-container">
      {loading && <div className="loading-overlay">데이터를 불러오는 중...</div>}

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
          <img src="/mcm_logo.png" alt="MCM Logo" onError={(e) => (e.target.src = 'https://via.placeholder.com/220?text=MCM')} />
        </div>
        <div className="home-hero">
          <div className="home-sub">FROM HERITAGE TO THE NEXT CENTURY</div>
          <h1 className="home-title">MCM TIME<br />PORTAL 2076</h1>
          <p className="home-desc">
            MCM의 과거를 선택하고<br />다음 세기의 제품을 직접 설계하세요.
          </p>
        </div>
        <div style={{ width: '100%', maxWidth: '600px', marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button className="btn-primary" data-text="TIME PORTAL ENTER" onClick={() => goToScreen(2)}>
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
          <h1 className="page-title">어떤 MCM에서<br />시작할까요?</h1>
          <p className="page-desc">미래로 번역할 아카이브 제품을 선택해주세요.</p>
        </div>

        <div className="product-list">
          {products.map((prod) => (
            <div
              key={prod.id}
              className={`product-card ${selectedProductId === prod.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedProductId(prod.id);
                setSelectedDnaIds([]);
              }}
            >
              <div className="card-img-wrap">
                <img src={prod.img || `/p2_image${prod.id}_2.png`} alt={prod.name} onError={(e) => (e.target.src = 'https://via.placeholder.com/90?text=MCM')} />
              </div>
              <div className="card-info">
                <div className="card-title">{prod.name}</div>
                <div className="card-desc">{prod.shortDescription}</div>
                <div className="tag-group">
                  {prod.tags?.slice(0, 2).map((tag, i) => (
                    <span className="tag" key={i}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="btn-primary" data-text="이 제품으로 시작하기" disabled={!selectedProductId} onClick={() => goToScreen(3)}>
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
          <h1 className="page-title">이 제품의 DNA를<br />분해해볼게요</h1>
          <p className="page-desc">MCM을 MCM답게 만드는 시각적·기능적 요소를 보여줍니다.</p>
        </div>

        {currentProduct && (
          <>
            <div className="product-display-card">
              <div className="display-img-box">
                <img src={currentProduct.img || `/p2_image${currentProduct.id}_2.png`} alt={currentProduct.name} />
              </div>
              <div className="display-title">{currentProduct.name}</div>
            </div>

            <div className="dna-stats-container">
              {dnaAnalysis.map((item, idx) => (
                <div className="dna-stat-item" key={idx}>
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

        <button className="btn-primary" data-text="Heritage Lock 설정하기" onClick={() => goToScreen(4)}>
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
          <h1 className="page-title">100년 뒤에도 남길<br />MCM DNA를 골라주세요</h1>
          <p className="page-desc">최소 1개가 미래 제품에 반드시 유지됩니다.</p>
        </div>

        {/* 2x2 카드 그리드 */}
        <div className="dna-grid">
          {heritageLocks.map((item) => {
            const isSelected = selectedDnaIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={`dna-lock-card ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleDnaLock(item.id)}
              >
                <div className="dna-card-header">
                  <div className="dna-card-title">{item.name}</div>
                  {isSelected && <span className="locked-badge">LOCKED</span>}
                </div>
                <div className="dna-card-desc">{item.description}</div>
              </div>
            );
          })}
        </div>

        {/* 하단 Locked DNA 요약 박스 */}
        <div className="locked-summary-box">
          <div className="summary-title">Locked DNA</div>
          <div className="summary-content">
            {selectedDnaIds.length === 0
              ? '선택된 DNA가 없습니다.'
              : selectedDnaIds
                  .map((id) => heritageLocks.find((d) => d.id === id)?.name?.toUpperCase())
                  .filter(Boolean)
                  .join(' · ')}
          </div>
        </div>

        <button
          className="btn-primary"
          data-text="미래 환경 선택하기"
          disabled={selectedDnaIds.length === 0}
          onClick={() => goToScreen(5)}
        >
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
          <h1 className="page-title">2076년, 이 제품은<br />어디에서 사용될까요?</h1>
          <p className="page-desc">미래 환경에 따라 기능과 소재가 자동으로 설계됩니다.</p>
        </div>

        <div className="env-list">
          {futureContexts.map((env) => (
            <div
              key={env.id}
              className={`env-card ${selectedContextId === env.id ? 'selected' : ''}`}
              onClick={() => setSelectedContextId(env.id)}
            >
              <div className="env-icon-wrap">{getEnvIcon(env)}</div>
              <div className="env-info">
                <div className="env-title">{env.name}</div>
                <div className="env-desc">{env.description}</div>
              </div>
            </div>
          ))}
        </div>

        <button className="btn-primary" data-text="2076년 제품 생성하기" disabled={!selectedContextId} onClick={handleGenerate}>
          2076년 제품 생성하기
        </button>
      </div>
    </div>
  );
}
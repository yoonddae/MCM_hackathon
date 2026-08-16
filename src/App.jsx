import { useState, useEffect } from 'react';
import './App.css';

// ⚠️ 백엔드 서버 기본 URL (백엔드 개발자분께 전달받은 주소로 변경하세요)
const API_BASE_URL = 'https://api.yourdomain.com';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [currentTime, setCurrentTime] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // API로부터 받아올 데이터를 담는 State
  const [products, setProducts] = useState([]);
  const [dnaAnalysis, setDnaAnalysis] = useState([]);
  const [heritageLocks, setHeritageLocks] = useState([]);
  const [futureContexts, setFutureContexts] = useState([]);

  // 사용자 선택 상태값들
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedDnaIds, setSelectedDnaIds] = useState([]);
  const [selectedContextId, setSelectedContextId] = useState(null);

  // 로딩 및 애니메이션 진행률 State
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

  // 토스트 메시지 함수
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // ==========================================
  // [API 호출 1] 2페이지: 제품 목록 조회
  // GET /api/products (예시)
  // ==========================================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/products`);
      const result = await res.json();
      if (result.success) {
        setProducts(result.data.products);
      }
    } catch (err) {
      console.error("제품 목록 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // [API 호출 2] 3페이지: 선택한 제품의 DNA 분석 비율 조회
  // GET /api/products/:id/dna (예시)
  // ==========================================
  const fetchDnaAnalysis = async (productId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/products/${productId}/dna`);
      const data = await res.json();
      // 명세서 응답 형태: { archiveProductId: 1, dnaAnalysis: [...] }
      const analysisData = data.dnaAnalysis || [];
      setDnaAnalysis(analysisData);

      // DNA 애니메이션 진행률 설정
      setDnaProgressValues(analysisData.map(() => 0));
      setTimeout(() => {
        setDnaProgressValues(analysisData.map((item) => item.ratio));
      }, 150);
    } catch (err) {
      console.error("DNA 분석 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // [API 호출 3] 4페이지: Heritage Lock 옵션 조회
  // GET /api/products/:id/heritage-locks (예시)
  // ==========================================
  const fetchHeritageLocks = async (productId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/products/${productId}/heritage-locks`);
      const data = await res.json();
      // 명세서 응답 형태: { archiveProductId: 1, heritageLockOptions: [...] }
      setHeritageLocks(data.heritageLockOptions || []);
    } catch (err) {
      console.error("Heritage Lock 옵션 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // [API 호출 4] 5페이지: 미래 환경 목록 조회
  // GET /api/future-contexts (예시)
  // ==========================================
  const fetchFutureContexts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/future-contexts`);
      const data = await res.json();
      // 명세서 응답 형태: { futureContexts: [...] }
      setFutureContexts(data.futureContexts || []);
    } catch (err) {
      console.error("미래 환경 목록 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // 화면 전환 시 필요한 API 자동 호출
  const goToScreen = (screenNum) => {
    setCurrentScreen(screenNum);

    if (screenNum === 2 && products.length === 0) {
      fetchProducts();
    } else if (screenNum === 3 && selectedProductId) {
      fetchDnaAnalysis(selectedProductId);
    } else if (screenNum === 4 && selectedProductId) {
      fetchHeritageLocks(selectedProductId);
    } else if (screenNum === 5 && futureContexts.length === 0) {
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
  // [API 호출 5] POST: 최종 AI 생성 요청
  // POST /api/generate (예시)
  // ==========================================
  const handleGenerate = async () => {
    const requestPayload = {
      archiveProductId: selectedProductId,
      lockedDnaIds: selectedDnaIds,
      futureContextId: selectedContextId
    };

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });
      const result = await res.json();

      // 명세서 응답: { success: true, data: { generationId: 101, status: "GENERATING" } }
      if (result.success) {
        alert(
          `[생성 요청 API 완료]\n- Generation ID: ${result.data.generationId}\n- Status: ${result.data.status}\n\nAI 생성 요청이 정상 처리되었습니다.`
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

  // 환경 아이콘 매핑 (명세서에 아이콘이 없다면 임의 지정)
  const getEnvIcon = (id) => {
    const icons = { 1: "🚀", 2: "🏙️", 3: "🌧️", 4: "🔮" };
    return icons[id] || "✨";
  };

  return (
    <div className="app-container">
      {/* 로딩 표시 */}
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
                {/* 명세서에 이미지 경로가 없을 경우를 대비한 기본값 처리 */}
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
                  <span className="locked-badge">LOCKED</span>
                </div>
                <div className="dna-card-desc">{item.description}</div>
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
                  .map((id) => heritageLocks.find((d) => d.id === id)?.name)
                  .filter(Boolean)
                  .join(' · ')}
          </div>
        </div>

        <button className="btn-primary" data-text="미래 환경 선택하기" disabled={selectedDnaIds.length === 0} onClick={() => goToScreen(5)}>
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
              <div className="env-icon-wrap">{getEnvIcon(env.id)}</div>
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
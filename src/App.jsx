function App() {
  return (
    <div className="app">
      <header className="page-header">
        <div>
          <p className="semester">2026학년도 2학기</p>

          <h1>SW와 문제해결 | 활동 지원 현황</h1>

          <p className="description">
            공모전 및 대외활동 지원 계획과 진행 현황을 정리합니다.
          </p>
        </div>

        <button className="admin-button">관리자</button>
      </header>

      <main>
        {/* 상단 현황 */}
        <section className="summary-grid">
          <div className="summary-card">
            <span>전체 활동</span>
            <strong>8</strong>
          </div>

          <div className="summary-card">
            <span>지원 예정</span>
            <strong>3</strong>
          </div>

          <div className="summary-card">
            <span>지원 완료</span>
            <strong>4</strong>
          </div>

          <div className="summary-card">
            <span>종료</span>
            <strong>1</strong>
          </div>
        </section>

        {/* 검색 + 정렬 */}
        <section className="controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="활동명 또는 주최기관 검색"
            />
          </div>

          <div className="control-group">
            <select defaultValue="deadline">
              <option value="deadline">마감 임박순</option>
              <option value="latest">최신 등록순</option>
              <option value="updated">최근 업데이트순</option>
            </select>
          </div>
        </section>

        {/* 상태 필터 */}
        <section className="status-filter">
          <button className="filter-button active">전체</button>
          <button className="filter-button">지원 예정</button>
          <button className="filter-button">지원 완료</button>
          <button className="filter-button">종료</button>
        </section>
      </main>
    </div>
  )
}

export default App
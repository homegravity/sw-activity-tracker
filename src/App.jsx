import { useState } from "react"


const initialActivities = [
  {
    id: 1,
    title: "2026 AI 서비스 아이디어 공모전",
    organization: "한국산업진흥원",
    status: "planned",
    deadline: "2026-10-02",
    category: "AI · 기획",
    progress: "제안서 작성 중",
    createdAt: "2026-09-25",
    updatedAt: "2026-09-29",
  },
  {
    id: 2,
    title: "서민금융진흥원 대국민 혁신 아이디어 공모전",
    organization: "서민금융진흥원",
    status: "completed",
    deadline: "2026-09-30",
    appliedAt: "2026-09-28",
    category: "AI · 공공서비스",
    createdAt: "2026-09-20",
    updatedAt: "2026-09-28",
  },
]

const statusLabels = {
  planned: "지원 예정",
  completed: "지원 완료",
  ended: "종료",
}

const statusClasses = {
  planned: "status-planned",
  completed: "status-completed",
  ended: "status-ended",
}

function getDday(deadline) {
  const today = new Date()

  const todayDate = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )

  const [year, month, day] = deadline.split("-").map(Number)

  const deadlineDate = Date.UTC(
    year,
    month - 1,
    day
  )

  const diff =
    (deadlineDate - todayDate) / (1000 * 60 * 60 * 24)

  if (diff > 0) {
    return `D-${diff}`
  }

  if (diff === 0) {
    return "D-Day"
  }

  return `D+${Math.abs(diff)}`
}




function getDateDiff(deadline) {
  const today = new Date()

  const todayDate = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )

  const [year, month, day] = deadline.split("-").map(Number)

  const deadlineDate = Date.UTC(
    year,
    month - 1,
    day
  )

  return (deadlineDate - todayDate) / (1000 * 60 * 60 * 24)
}





function getDdayClass(deadline) {
  const today = new Date()

  const todayDate = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )

  const [year, month, day] = deadline.split("-").map(Number)

  const deadlineDate = Date.UTC(
    year,
    month - 1,
    day
  )

  const diff =
    (deadlineDate - todayDate) / (1000 * 60 * 60 * 24)

  if (diff < 0) {
    return "dday-passed"
  }

  if (diff === 0) {
    return "dday-today"
  }

  if (diff <= 3) {
    return "dday-urgent"
  }

  if (diff <= 7) {
    return "dday-soon"
  }

  return "dday-normal"
}

function formatDate(date) {
  if (!date) {
    return "-"
  }

  return date.split("-").join(".")
}

function getTodayString() {
  const today = new Date()

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}



function App() {

  const [activities, setActivities] = useState(initialActivities)

  const [selectedStatus, setSelectedStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState("deadline")
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

const [editFormData, setEditFormData] = useState({
  id: null,
  title: "",
  organization: "",
  category: "",
  status: "planned",
  deadline: "",
  appliedAt: "",
  link: "",
  progress: "",
  memo: "",
})
  
  
  
  const [formData, setFormData] = useState({
    title: "",
    organization: "",
    category: "",
    status: "planned",
    deadline: "",
    appliedAt: "",
    link: "",
    progress: "",
    memo: "",
  })

  function handleFormChange(event) {
    const { name, value } = event.target
  
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleAddActivity() {
    if (!formData.title.trim()) {
      alert("활동명을 입력해주세요.")
      return
    }
  
    if (!formData.deadline) {
      alert("마감일을 입력해주세요.")
      return
    }
    if (formData.status === "completed" && !formData.appliedAt) {
      alert("지원 완료 활동은 지원일을 입력해주세요.")
      return
    }
  
   


    const today = getTodayString()
  
    const newActivity = {
      id: Date.now(),
      title: formData.title.trim(),
      organization: formData.organization.trim(),
      category: formData.category.trim(),
      status: formData.status,
      deadline: formData.deadline,
      appliedAt:
        formData.status === "completed"
          ? formData.appliedAt
          : "",
      link: formData.link.trim(),
      progress: formData.progress.trim(),
      memo: formData.memo.trim(),
      createdAt: today,
      updatedAt: today,
    }
  
    setActivities((prev) => [
      ...prev,
      newActivity,
    ])
  
    setFormData({
      title: "",
      organization: "",
      category: "",
      status: "planned",
      deadline: "",
      appliedAt: "",
      link: "",
      progress: "",
      memo: "",
    })
  
    setIsAddModalOpen(false)
  }

  function handleDeleteActivity(id) {
    const confirmed = window.confirm(
      "이 활동을 삭제하시겠습니까?"
    )
  
    if (!confirmed) {
      return
    }
  
    setActivities((prev) =>
      prev.filter((activity) => activity.id !== id)
    )
  
    setSelectedActivity(null)
  }

  function handleOpenEdit(activity) {
    setEditFormData({
      id: activity.id,
      title: activity.title || "",
      organization: activity.organization || "",
      category: activity.category || "",
      status: activity.status || "planned",
      deadline: activity.deadline || "",
      appliedAt: activity.appliedAt || "",
      link: activity.link || "",
      progress: activity.progress || "",
      memo: activity.memo || "",
    })
  
    setSelectedActivity(null)
    setIsEditModalOpen(true)
  }



  function handleEditFormChange(event) {
    const { name, value } = event.target
  
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }


  function handleUpdateActivity() {
    if (!editFormData.title.trim()) {
      alert("활동명을 입력해주세요.")
      return
    }
  
    if (!editFormData.deadline) {
      alert("마감일을 입력해주세요.")
      return
    }
  
    if (
      editFormData.status === "completed" &&
      !editFormData.appliedAt
    ) {
      alert("지원 완료 활동은 지원일을 입력해주세요.")
      return
    }
  
    const updatedActivity = {
      ...editFormData,
  
      title: editFormData.title.trim(),
      organization: editFormData.organization.trim(),
      category: editFormData.category.trim(),
  
      appliedAt:
        editFormData.status === "completed"
          ? editFormData.appliedAt
          : "",
  
      link: editFormData.link.trim(),
      progress: editFormData.progress.trim(),
      memo: editFormData.memo.trim(),
  
      updatedAt: getTodayString(),
    }
  
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === updatedActivity.id
          ? {
              ...activity,
              ...updatedActivity,
            }
          : activity
      )
    )
  
    setIsEditModalOpen(false)
  }

  const filteredActivities = activities.filter((activity) => {
    const matchesStatus =
      selectedStatus === "all" ||
      activity.status === selectedStatus
  
    const keyword = searchTerm.toLowerCase()
  
    const matchesSearch =
      activity.title.toLowerCase().includes(keyword) ||
      activity.organization.toLowerCase().includes(keyword)
  
    return matchesStatus && matchesSearch
  })


  const sortedActivities = [...filteredActivities].sort((a, b) => {
    if (sortOption === "latest") {
      return b.createdAt.localeCompare(a.createdAt)
    }
  
    if (sortOption === "updated") {
      return b.updatedAt.localeCompare(a.updatedAt)
    }
  
    const diffA = getDateDiff(a.deadline)
    const diffB = getDateDiff(b.deadline)
  
    const isUpcomingA = diffA >= 0
    const isUpcomingB = diffB >= 0
  
    if (isUpcomingA && !isUpcomingB) {
      return -1
    }
  
    if (!isUpcomingA && isUpcomingB) {
      return 1
    }
  
    if (isUpcomingA && isUpcomingB) {
      return diffA - diffB
    }
  
    return diffB - diffA
  })


  const totalCount = activities.length

  const plannedCount = activities.filter(
    (activity) => activity.status === "planned"
  ).length

  const completedCount = activities.filter(
    (activity) => activity.status === "completed"
  ).length

  const endedCount = activities.filter(
    (activity) => activity.status === "ended"
  ).length

  return (
    <div className="app">
      <header className="page-header">
        <div>
          <p className="semester">2026학년도 2학기</p>

          <h1>SW와 문제해결 | 활동 지원 현황</h1>

          <p className="description">
            공모전 및 대외활동 지원 계획과 진행 현황을 정리합니다.
          </p>

          <p className="last-updated">
            최근 업데이트 2026.09.29
          </p>
        </div>

        <div className="header-actions">
            {isAdmin ? (
              <>
                <span className="admin-mode-label">
                  관리자 모드
                </span>

                <button
                  className="admin-button"
                  onClick={() => setIsAdmin(false)}
                >
                  나가기
                </button>
              </>
            ) : (
              <button
                className="admin-button"
                onClick={() => setIsAdmin(true)}
              >
                관리자
              </button>
            )}
          </div>
      </header>

      <main>
        {/* 상단 현황 */}
        <section className="summary-grid">
          <div className="summary-card">
            <span>전체 활동</span>
            <strong>{totalCount}</strong>
          </div>

          <div className="summary-card">
            <span>지원 예정</span>
            <strong>{plannedCount}</strong>
          </div>

          <div className="summary-card">
            <span>지원 완료</span>
            <strong>{completedCount}</strong>
          </div>

          <div className="summary-card">
            <span>종료</span>
            <strong>{endedCount}</strong>
          </div>
        </section>

        {/* 검색 + 정렬 */}
        <section className="controls">
          <div className="search-box">
          <input
              type="text"
              placeholder="활동명 또는 주최기관 검색"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="control-group">
          <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
            >
              <option value="deadline">
                마감 임박순
              </option>

              <option value="latest">
                최신 등록순
              </option>

              <option value="updated">
                최근 업데이트순
              </option>
            </select>
          </div>
        </section>

        {/* 상태 필터 */}
        <section className="status-filter">
          <button
            className={`filter-button ${
              selectedStatus === "all" ? "active" : ""
            }`}
            onClick={() => setSelectedStatus("all")}
          >
            전체
          </button>

          <button
            className={`filter-button ${
              selectedStatus === "planned" ? "active" : ""
            }`}
            onClick={() => setSelectedStatus("planned")}
          >
            지원 예정
          </button>

          <button
            className={`filter-button ${
              selectedStatus === "completed" ? "active" : ""
            }`}
            onClick={() => setSelectedStatus("completed")}
          >
            지원 완료
          </button>

          <button
            className={`filter-button ${
              selectedStatus === "ended" ? "active" : ""
            }`}
            onClick={() => setSelectedStatus("ended")}
          >
            종료
          </button>
        </section>

        {isAdmin && (
          <section className="admin-toolbar">
            <button
              className="add-activity-button"
              onClick={() => setIsAddModalOpen(true)}
            >
              + 활동 추가
            </button>
          </section>
        )}



        {/* 활동 목록 */}
        <section className="activity-list">
        {sortedActivities.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">
              표시할 활동이 없습니다.
            </p>

            <p className="empty-description">
              검색어나 상태 필터를 변경해보세요.
            </p>
          </div>
        ) : (
          sortedActivities.map((activity) => (
            <article
              className="activity-card"
              key={activity.id}
            >
              <div className="activity-main">
                <div className="activity-top">
                  <span
                    className={`status-badge ${
                      statusClasses[activity.status]
                    }`}
                  >
                    {statusLabels[activity.status]}
                  </span>

                  {activity.status === "planned" ? (
                    <span
                      className={`dday ${getDdayClass(
                        activity.deadline
                      )}`}
                    >
                      {getDday(activity.deadline)}
                    </span>
                  ) : (
                    <span className="completed-text">
                      {activity.status === "completed"
                        ? "제출 완료"
                        : "종료"}
                    </span>
                  )}
                </div>

                <h2>{activity.title}</h2>

                <p className="organization">
                  {activity.organization}
                </p>

                <div className="activity-info">
                  <div>
                    <span>마감일</span>
                    <strong>
                      {formatDate(activity.deadline)}
                    </strong>
                  </div>

                  {activity.status === "completed" ? (
                    <>
                      <div>
                        <span>지원일</span>
                        <strong>
                          {formatDate(activity.appliedAt)}
                        </strong>
                      </div>

                      <div>
                        <span>분야</span>
                        <strong>
                          {activity.category}
                        </strong>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span>분야</span>
                        <strong>
                          {activity.category}
                        </strong>
                      </div>

                      <div>
                        <span>진행 상황</span>
                        <strong>
                          {activity.progress}
                        </strong>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="activity-actions">
              {activity.link && (
                <a
                  className="secondary-button"
                  href={activity.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  공고 보기
                </a>
              )}

              {activity.status === "completed" && (
                <button className="secondary-button">
                  증빙 보기
                </button>
              )}

              <button
                className="detail-button"
                onClick={() => setSelectedActivity(activity)}
              >
                상세보기
              </button>
            </div>
            </article>
          ))
        )}
      </section>
      </main>
    
      {isAddModalOpen && (
  <div
    className="modal-overlay"
    onClick={() => setIsAddModalOpen(false)}
  >
    <div
      className="modal"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="modal-header">
        <div>
          <h2>새 활동 추가</h2>
          <p>공모전 또는 대외활동 정보를 입력해주세요.</p>
        </div>

        <button
          className="modal-close-button"
          onClick={() => setIsAddModalOpen(false)}
        >
          ×
        </button>
      </div>

      <div className="form-grid">
        <div className="form-field form-field-full">
          <label>활동명</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleFormChange}
            placeholder="공모전 또는 대외활동 이름"
          />
        </div>

        {formData.status === "completed" && (
          <div className="form-field">
            <label>지원일</label>
            <input
              type="date"
              name="appliedAt"
              value={formData.appliedAt}
              onChange={handleFormChange}
            />
          </div>
        )}





        <div className="form-field">
          <label>분야</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleFormChange}
            placeholder="예: AI · 기획"
          />
        </div>

        <div className="form-field">
          <label>상태</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleFormChange}
          >
            <option value="planned">지원 예정</option>
            <option value="completed">지원 완료</option>
            <option value="ended">종료</option>
          </select>
        </div>

        <div className="form-field">
          <label>마감일</label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleFormChange}
          />
        </div>

        

        <div className="form-field form-field-full">
          <label>공고 / 신청 링크</label>
          <input
            type="url"
            name="link"
            value={formData.link}
            onChange={handleFormChange}
            placeholder="https://..."
          />
        </div>

        <div className="form-field form-field-full">
          <label>진행 상황</label>
          <input
            type="text"
            name="progress"
            value={formData.progress}
            onChange={handleFormChange}
            placeholder="예: 제안서 작성 중"
          />
        </div>

        <div className="form-field form-field-full">
          <label>메모</label>
          <textarea
            name="memo"
            value={formData.memo}
            onChange={handleFormChange}
            rows="4"
            placeholder="활동에 대한 추가 내용을 입력해주세요."
          />
        </div>
      </div>

      <div className="modal-actions">
        <button
          className="modal-cancel-button"
          onClick={() => setIsAddModalOpen(false)}
        >
          취소
        </button>

        <button
            className="modal-save-button"
            type="button"
            onClick={handleAddActivity}
          >
            활동 추가
          </button>
      </div>
    </div>
  </div>
)}
    


  
  {isEditModalOpen && (
  <div
    className="modal-overlay"
    onClick={() => setIsEditModalOpen(false)}
  >
    <div
      className="modal"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="modal-header">
        <div>
          <h2>활동 수정</h2>
          <p>등록된 활동 정보를 수정합니다.</p>
        </div>

        <button
          className="modal-close-button"
          onClick={() => setIsEditModalOpen(false)}
        >
          ×
        </button>
      </div>

      <div className="form-grid">
        <div className="form-field form-field-full">
          <label>활동명</label>
          <input
            type="text"
            name="title"
            value={editFormData.title}
            onChange={handleEditFormChange}
          />
        </div>

        <div className="form-field">
          <label>주최기관</label>
          <input
            type="text"
            name="organization"
            value={editFormData.organization}
            onChange={handleEditFormChange}
          />
        </div>

        <div className="form-field">
          <label>분야</label>
          <input
            type="text"
            name="category"
            value={editFormData.category}
            onChange={handleEditFormChange}
          />
        </div>

        <div className="form-field">
          <label>상태</label>
          <select
            name="status"
            value={editFormData.status}
            onChange={handleEditFormChange}
          >
            <option value="planned">지원 예정</option>
            <option value="completed">지원 완료</option>
            <option value="ended">종료</option>
          </select>
        </div>

        <div className="form-field">
          <label>마감일</label>
          <input
            type="date"
            name="deadline"
            value={editFormData.deadline}
            onChange={handleEditFormChange}
          />
        </div>

        {editFormData.status === "completed" && (
          <div className="form-field">
            <label>지원일</label>
            <input
              type="date"
              name="appliedAt"
              value={editFormData.appliedAt}
              onChange={handleEditFormChange}
            />
          </div>
        )}

        <div className="form-field form-field-full">
          <label>공고 / 신청 링크</label>
          <input
            type="url"
            name="link"
            value={editFormData.link}
            onChange={handleEditFormChange}
            placeholder="https://..."
          />
        </div>

        <div className="form-field form-field-full">
          <label>진행 상황</label>
          <input
            type="text"
            name="progress"
            value={editFormData.progress}
            onChange={handleEditFormChange}
          />
        </div>

        <div className="form-field form-field-full">
          <label>메모</label>
          <textarea
            name="memo"
            value={editFormData.memo}
            onChange={handleEditFormChange}
            rows="4"
          />
        </div>
      </div>

      <div className="modal-actions">
        <button
          className="modal-cancel-button"
          onClick={() => setIsEditModalOpen(false)}
        >
          취소
        </button>

        <button
          className="modal-save-button"
          type="button"
          onClick={handleUpdateActivity}
        >
          변경사항 저장
        </button>
      </div>
    </div>
  </div>
)}




    {selectedActivity && (
  <div
    className="modal-overlay"
    onClick={() => setSelectedActivity(null)}
  >
    <div
      className="modal detail-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="modal-header">
        <div>
          <span
            className={`status-badge ${
              statusClasses[selectedActivity.status]
            }`}
          >
            {statusLabels[selectedActivity.status]}
          </span>

          <h2 className="detail-title">
            {selectedActivity.title}
          </h2>

          <p>
            {selectedActivity.organization || "주최기관 정보 없음"}
          </p>
        </div>

        <button
          className="modal-close-button"
          onClick={() => setSelectedActivity(null)}
        >
          ×
        </button>
      </div>

      <div className="detail-grid">
        <div className="detail-item">
          <span>분야</span>
          <strong>
            {selectedActivity.category || "-"}
          </strong>
        </div>

        <div className="detail-item">
          <span>마감일</span>
          <strong>
            {formatDate(selectedActivity.deadline)}
          </strong>
        </div>

        {selectedActivity.status === "completed" && (
          <div className="detail-item">
            <span>지원일</span>
            <strong>
              {formatDate(selectedActivity.appliedAt)}
            </strong>
          </div>
        )}

        <div className="detail-item">
          <span>진행 상황</span>
          <strong>
            {selectedActivity.progress || "-"}
          </strong>
        </div>
      </div>

      <div className="detail-section">
        <h3>메모</h3>

        <p>
          {selectedActivity.memo ||
            "등록된 메모가 없습니다."}
        </p>
      </div>

      {selectedActivity.link && (
        <div className="detail-section">
          <h3>공고 / 신청 페이지</h3>

          <a
            className="secondary-button"
            href={selectedActivity.link}
            target="_blank"
            rel="noreferrer"
          >
            공고 페이지 열기
          </a>
        </div>
      )}

<div className="modal-actions detail-actions">
  {isAdmin && (
    <div className="admin-detail-actions">
      <button
          className="edit-button"
          type="button"
          onClick={() => handleOpenEdit(selectedActivity)}
        >
          수정
        </button>

      <button
        className="delete-button"
        type="button"
        onClick={() =>
          handleDeleteActivity(selectedActivity.id)
        }
      >
        삭제
      </button>
    </div>
  )}

  <button
    className="modal-cancel-button"
    onClick={() => setSelectedActivity(null)}
  >
    닫기
  </button>
</div>
    </div>
  </div>
)}
    
    </div>
  )
}

export default App
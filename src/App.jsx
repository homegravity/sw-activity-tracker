import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"




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




function formatUpdatedDate(dateString) {
  if (!dateString) {
    return "-"
  }

  const date = new Date(dateString)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}.${month}.${day}`
}



function mapActivityFromDb(activity) {
  return {
    id: activity.id,
    title: activity.title,
    organization: activity.organization || "",
    category: activity.category || "",
    status: activity.status,
    deadline: activity.deadline,
    appliedAt: activity.applied_at || "",
    link: activity.link || "",
    progress: activity.progress || "",
    memo: activity.memo || "",
    createdAt: activity.created_at,
    updatedAt: activity.updated_at,
  }
}

function App() {

  const [activities, setActivities] = useState([])

  const [selectedStatus, setSelectedStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState("deadline")
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  const [evidenceFiles, setEvidenceFiles] = useState([])
const [documentFiles, setDocumentFiles] = useState([])



  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
const [newPassword, setNewPassword] = useState("")
const [newPasswordConfirm, setNewPasswordConfirm] = useState("")

const [activityFiles, setActivityFiles] = useState([])
const [isFilesLoading, setIsFilesLoading] = useState(false)
const [previewImageUrl, setPreviewImageUrl] = useState(null)

const [editActivityFiles, setEditActivityFiles] = useState([])
const [editEvidenceFiles, setEditEvidenceFiles] = useState([])
const [editDocumentFiles, setEditDocumentFiles] = useState([])



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


  useEffect(() => {
    async function fetchActivities() {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
  
      if (error) {
        console.error("활동 불러오기 오류:", error)
        return
      }
  
      setActivities(
        data.map((activity) => mapActivityFromDb(activity))
      )
    }
  
    fetchActivities()
  }, [])


  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
  
      setIsAdmin(!!session)
    }
  
    checkSession()
  
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session)
    })
  
    return () => {
      subscription.unsubscribe()
    }
  }, [])


  useEffect(() => {
    async function fetchActivityFiles() {
      if (!selectedActivity) {
        setActivityFiles([])
        return
      }
  
      setIsFilesLoading(true)
  
      const { data, error } = await supabase
        .from("activity_files")
        .select("*")
        .eq("activity_id", selectedActivity.id)
        .order("created_at", { ascending: true })
  
      if (error) {
        console.error("첨부파일 불러오기 오류:", error)
        setActivityFiles([])
        setIsFilesLoading(false)
        return
      }
  
      setActivityFiles(data || [])
      setIsFilesLoading(false)
    }
  
    fetchActivityFiles()
  }, [selectedActivity])


  useEffect(() => {
    async function fetchEditActivityFiles() {
      if (!isEditModalOpen || !editFormData.id) {
        setEditActivityFiles([])
        return
      }
  
      const { data, error } = await supabase
        .from("activity_files")
        .select("*")
        .eq("activity_id", editFormData.id)
        .order("created_at", { ascending: true })
  
      if (error) {
        console.error("수정용 첨부파일 불러오기 오류:", error)
        setEditActivityFiles([])
        return
      }
  
      setEditActivityFiles(data || [])
    }
  
    fetchEditActivityFiles()
  }, [isEditModalOpen, editFormData.id])






  async function handleAdminLogin() {
    setLoginError("")
  
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError("이메일과 비밀번호를 입력해주세요.")
      return
    }
  
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    })
  
    if (error) {
      setLoginError("이메일 또는 비밀번호를 확인해주세요.")
      return
    }
  
    setIsLoginModalOpen(false)
    setLoginPassword("")
  }


  async function handleAdminLogout() {
    const { error } = await supabase.auth.signOut()
  
    if (error) {
      alert("로그아웃 중 오류가 발생했습니다.")
      return
    }
  
    setIsAdmin(false)
  }

  function handleFormChange(event) {
    const { name, value } = event.target
  
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }


  function getFilePublicUrl(filePath) {
    const { data } = supabase.storage
      .from("activity-files")
      .getPublicUrl(filePath)
  
    return data.publicUrl
  }

  async function handleDownloadFile(file) {
    const { data, error } = await supabase.storage
      .from("activity-files")
      .download(file.file_path)
  
    if (error) {
      console.error("파일 다운로드 오류:", error)
      alert("파일을 다운로드하는 중 오류가 발생했습니다.")
      return
    }
  
    const url = URL.createObjectURL(data)
  
    const link = document.createElement("a")
    link.href = url
    link.download = file.file_name
  
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  
    URL.revokeObjectURL(url)
  }



  async function handleChangePassword() {
    if (newPassword.length < 6) {
      alert("비밀번호는 6자 이상 입력해주세요.")
      return
    }
  
    if (newPassword !== newPasswordConfirm) {
      alert("비밀번호가 서로 일치하지 않습니다.")
      return
    }
  
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
  
    if (error) {
      console.error("비밀번호 변경 오류:", error)
      alert("비밀번호 변경 중 오류가 발생했습니다.")
      return
    }
  
    alert("비밀번호가 변경되었습니다.")
  
    setNewPassword("")
    setNewPasswordConfirm("")
    setIsPasswordModalOpen(false)
  }




  async function handleDeleteAttachment(file) {
    const confirmed = window.confirm(
      `${file.file_name} 파일을 삭제하시겠습니까?`
    )
  
    if (!confirmed) {
      return
    }
  
    // 1. Storage 실제 파일 먼저 삭제
    const { error: storageError } = await supabase.storage
      .from("activity-files")
      .remove([file.file_path])
  
    if (storageError) {
      console.error("Storage 파일 삭제 오류:", storageError)
      alert("첨부파일 삭제에 실패했습니다.")
      return
    }





  
    // 2. activity_files 테이블에서 파일 정보 삭제
    const { error: dbError } = await supabase
      .from("activity_files")
      .delete()
      .eq("id", file.id)
  
    if (dbError) {
      console.error("첨부파일 정보 삭제 오류:", dbError)
  
      alert(
        "실제 파일은 삭제되었지만 파일 정보 정리에 실패했습니다."
      )
      return
    }
  
    // 3. 수정창에서도 즉시 제거
    setEditActivityFiles((prev) =>
      prev.filter((item) => item.id !== file.id)
    )
  
    await touchActivityUpdatedAt(file.activity_id)
  }
  
  
  



  async function uploadActivityFiles(activityId, files, fileKind) {
    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) {
        throw new Error(`${file.name} 파일이 20MB를 초과합니다.`)
      }
  
      const extension =
        file.name.includes(".")
          ? file.name.split(".").pop().toLowerCase()
          : "file"
  
      const folder =
        fileKind === "evidence"
          ? "evidence"
          : "documents"
  
      const filePath =
        `${activityId}/${folder}/${crypto.randomUUID()}.${extension}`
  
      const { error: uploadError } = await supabase.storage
        .from("activity-files")
        .upload(filePath, file, {
          contentType: file.type || undefined,
          upsert: false,
        })
  
      if (uploadError) {
        console.error("파일 업로드 오류:", uploadError)
  
        throw new Error(
          `${file.name} 업로드에 실패했습니다.`
        )
      }
  
      const { error: dbError } = await supabase
        .from("activity_files")
        .insert({
          activity_id: activityId,
          file_kind: fileKind,
          file_name: file.name,
          file_path: filePath,
          mime_type: file.type || null,
          size_bytes: file.size,
        })
  
      if (dbError) {
        console.error("파일 정보 저장 오류:", dbError)
  
        await supabase.storage
          .from("activity-files")
          .remove([filePath])
  
        throw new Error(
          `${file.name}의 파일 정보를 저장하지 못했습니다.`
        )
      }
    }
  }


  async function handleUpdateActivity() {
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
  
    // 1. 활동 정보 수정
    const { data, error } = await supabase
      .from("activities")
      .update({
        title: editFormData.title.trim(),
        organization: editFormData.organization.trim(),
        category: editFormData.category.trim(),
        status: editFormData.status,
        deadline: editFormData.deadline,
  
        applied_at:
          editFormData.status === "completed"
            ? editFormData.appliedAt
            : null,
  
        link: editFormData.link.trim(),
        progress: editFormData.progress.trim(),
        memo: editFormData.memo.trim(),
  
        updated_at: new Date().toISOString(),
      })
      .eq("id", editFormData.id)
      .select()
      .single()
  
    if (error) {
      console.error("활동 수정 오류:", error)
      alert("활동을 수정하는 중 오류가 발생했습니다.")
      return
    }
  
    // 2. 수정하면서 새로 선택한 파일 업로드
    

    
    
    try {
      if (editEvidenceFiles.length > 0) {
        await uploadActivityFiles(
          data.id,
          editEvidenceFiles,
          "evidence"
        )
      }
  
      if (editDocumentFiles.length > 0) {
        await uploadActivityFiles(
          data.id,
          editDocumentFiles,
          "document"
        )
      }
    } catch (fileError) {
      console.error("첨부파일 추가 오류:", fileError)
  
      alert(
        `활동 정보는 수정되었지만 첨부파일 추가 중 문제가 발생했습니다.\n${fileError.message}`
      )
    }
  
    // 3. 화면의 활동 정보도 갱신
    const updatedActivity = mapActivityFromDb(data)
  
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === updatedActivity.id
          ? updatedActivity
          : activity
      )
    )
  
    // 4. 선택했던 새 파일 초기화
    setEditEvidenceFiles([])
    setEditDocumentFiles([])
  
    // 5. 수정창 닫기
    setIsEditModalOpen(false)
  }



  async function touchActivityUpdatedAt(activityId) {
    const updatedAt = new Date().toISOString()
  
    const { error } = await supabase
      .from("activities")
      .update({
        updated_at: updatedAt,
      })
      .eq("id", activityId)
  
    if (error) {
      console.error("최근 업데이트 시간 갱신 오류:", error)
      return
    }
  
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === activityId
          ? {
              ...activity,
              updatedAt,
            }
          : activity
      )
    )
  }

  async function handleAddActivity() {
    if (!formData.title.trim()) {
      alert("활동명을 입력해주세요.")
      return
    }
  
    if (!formData.deadline) {
      alert("마감일을 입력해주세요.")
      return
    }
  
    if (
      formData.status === "completed" &&
      !formData.appliedAt
    ) {
      alert("지원 완료 활동은 지원일을 입력해주세요.")
      return
    }
  
    const { data, error } = await supabase
      .from("activities")
      .insert({
        title: formData.title.trim(),
        organization: formData.organization.trim(),
        category: formData.category.trim(),
        status: formData.status,
        deadline: formData.deadline,
  
        applied_at:
          formData.status === "completed"
            ? formData.appliedAt
            : null,
  
        link: formData.link.trim(),
        progress: formData.progress.trim(),
        memo: formData.memo.trim(),
      })
      .select()
      .single()
  
    if (error) {
      console.error("활동 추가 오류:", error)
      alert("활동을 저장하는 중 오류가 발생했습니다.")
      return
    }
  
    try {
      if (evidenceFiles.length > 0) {
        await uploadActivityFiles(
          data.id,
          evidenceFiles,
          "evidence"
        )
      }
  
      if (documentFiles.length > 0) {
        await uploadActivityFiles(
          data.id,
          documentFiles,
          "document"
        )
      }
    } catch (fileError) {
      console.error("첨부파일 저장 오류:", fileError)
  
      alert(
        `활동은 저장되었지만 첨부파일 저장 중 문제가 발생했습니다.\n${fileError.message}`
      )
    }
  
    const newActivity = mapActivityFromDb(data)
  
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
  
    setEvidenceFiles([])
    setDocumentFiles([])
  
    setIsAddModalOpen(false)
  }
  
  async function handleDeleteActivity(id) {
    const confirmed = window.confirm(
      "이 활동을 삭제하시겠습니까?\n첨부파일도 함께 삭제됩니다."
    )
  
    if (!confirmed) {
      return
    }
  
    // 1. 연결된 파일 경로 먼저 가져오기
    const { data: files, error: filesError } = await supabase
      .from("activity_files")
      .select("file_path")
      .eq("activity_id", id)
  
    if (filesError) {
      console.error("첨부파일 목록 확인 오류:", filesError)
      alert("첨부파일 정보를 확인하는 중 오류가 발생했습니다.")
      return
    }
  
    const filePaths = (files || []).map(
      (file) => file.file_path
    )
  
    // 2. Storage 실제 파일부터 삭제
    if (filePaths.length > 0) {
      const { data: removedFiles, error: storageError } =
        await supabase.storage
          .from("activity-files")
          .remove(filePaths)
  
      if (storageError) {
        console.error("Storage 파일 삭제 오류:", storageError)
        alert("첨부파일 삭제에 실패하여 활동 삭제를 중단했습니다.")
        return
      }
  
      console.log("Storage 삭제 완료:", removedFiles)
    }
  
    // 3. 활동 삭제
    // activity_files DB 행은 cascade로 함께 삭제
    const { error: deleteError } = await supabase
      .from("activities")
      .delete()
      .eq("id", id)
  
    if (deleteError) {
      console.error("활동 삭제 오류:", deleteError)
      alert("활동을 삭제하는 중 오류가 발생했습니다.")
      return
    }
  
    // 4. 화면에서도 제거
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

  setEditEvidenceFiles([])
  setEditDocumentFiles([])

  setIsEditModalOpen(true)
}



  function handleEditFormChange(event) {
    const { name, value } = event.target
  
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
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

  const latestUpdatedAt = activities.reduce(
    (latest, activity) => {
      if (!activity.updatedAt) {
        return latest
      }
  
      if (!latest) {
        return activity.updatedAt
      }
  
      return new Date(activity.updatedAt) > new Date(latest)
        ? activity.updatedAt
        : latest
    },
    null
  )
  const lastUpdatedText = latestUpdatedAt
  ? formatUpdatedDate(latestUpdatedAt)
  : "-"



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
            최근 업데이트 {lastUpdatedText}
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
                onClick={() => setIsPasswordModalOpen(true)}
              >
                비밀번호 변경
              </button>



              <button
                className="admin-button"
                onClick={handleAdminLogout}
              >
                나가기
              </button>
            </>
          ) : (
            <button
              className="admin-button"
              onClick={() => setIsLoginModalOpen(true)}
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


    







      <div className="form-field form-field-full">
          <label>증빙 이미지</label>

          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            multiple
            onChange={(event) =>
              setEvidenceFiles(Array.from(event.target.files))
            }
          />

          <p className="file-help">
            접수 완료 화면이나 지원 인증 이미지를 추가할 수 있습니다.
          </p>

          {evidenceFiles.length > 0 && (
            <div className="selected-files">
              {evidenceFiles.map((file, index) => (
                <span key={`${file.name}-${index}`}>
                  {file.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="form-field form-field-full">
          <label>제출 파일</label>

          <input
            type="file"
            accept=".pdf,.doc,.docx,.hwp,.hwpx"
            multiple
            onChange={(event) =>
              setDocumentFiles(Array.from(event.target.files))
            }
          />

          <p className="file-help">
            PDF, Word, HWP, HWPX 파일을 여러 개 추가할 수 있습니다.
          </p>

          {documentFiles.length > 0 && (
            <div className="selected-files">
              {documentFiles.map((file, index) => (
                <span key={`${file.name}-${index}`}>
                  {file.name}
                </span>
              ))}
            </div>
          )}
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

      

        {/* 기존 첨부파일 */}
<div className="form-field form-field-full">
  <label>현재 첨부파일</label>

  {editActivityFiles.length === 0 ? (
    <p className="file-help">
      등록된 첨부파일이 없습니다.
    </p>
  ) : (
    <div className="selected-files">
      {editActivityFiles.map((file) => (
  <div
    className="edit-file-item"
    key={file.id}
  >
    <div>
      <span>{file.file_name}</span>

      <small>
              {file.file_kind === "evidence"
                ? "증빙 이미지"
                : "제출 파일"}
            </small>
          </div>

          <button
            type="button"
            className="file-delete-button"
            onClick={() => handleDeleteAttachment(file)}
          >
            삭제
          </button>
        </div>
      ))}
    </div>
  )}
</div>

{/* 새로운 증빙 이미지 */}
<div className="form-field form-field-full">
  <label>증빙 이미지 추가</label>

  <input
    type="file"
    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
    multiple
    onChange={(event) =>
      setEditEvidenceFiles(
        Array.from(event.target.files)
      )
    }
  />

  <p className="file-help">
    기존 이미지는 유지되고 새 이미지만 추가됩니다.
  </p>

  {editEvidenceFiles.length > 0 && (
    <div className="selected-files">
      {editEvidenceFiles.map((file, index) => (
        <span key={`${file.name}-${index}`}>
          {file.name}
        </span>
      ))}
    </div>
  )}
</div>

{/* 새로운 제출 파일 */}
<div className="form-field form-field-full">
  <label>제출 파일 추가</label>

  <input
    type="file"
    accept=".pdf,.doc,.docx,.hwp,.hwpx"
    multiple
    onChange={(event) =>
      setEditDocumentFiles(
        Array.from(event.target.files)
      )
    }
  />

  <p className="file-help">
    PDF, Word, HWP, HWPX 파일을 추가할 수 있습니다.
  </p>

  {editDocumentFiles.length > 0 && (
    <div className="selected-files">
      {editDocumentFiles.map((file, index) => (
        <span key={`${file.name}-${index}`}>
          {file.name}
        </span>
      ))}
    </div>
  )}
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


<div className="detail-section">
  <h3>첨부 자료</h3>

  {isFilesLoading ? (
    <p>첨부파일을 불러오는 중입니다.</p>
  ) : activityFiles.length === 0 ? (
    <p>등록된 첨부파일이 없습니다.</p>
  ) : (
    <>
      {activityFiles.some(
        (file) => file.file_kind === "evidence"
      ) && (
        <div className="attachment-group">
          <h4>증빙 이미지</h4>

          {activityFiles
            .filter(
              (file) => file.file_kind === "evidence"
            )
            .map((file) => (
              <div
                className="attachment-item"
                key={file.id}
              >
                <span>{file.file_name}</span>

                <button
                  className="secondary-button"
                  type="button"
                  onClick={() =>
                    setPreviewImageUrl(
                      getFilePublicUrl(file.file_path)
                    )
                  }
                >
                  보기
                </button>
              </div>
            ))}
        </div>
      )}

      {activityFiles.some(
        (file) => file.file_kind === "document"
      ) && (
        <div className="attachment-group">
          <h4>제출 파일</h4>

          {activityFiles
            .filter(
              (file) => file.file_kind === "document"
            )
            .map((file) => (
              <div
                className="attachment-item"
                key={file.id}
              >
                <span>{file.file_name}</span>

                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => handleDownloadFile(file)}
                >
                  다운로드
                </button>
              </div>
            ))}
        </div>
      )}
    </>
  )}
</div>




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
    


    {isLoginModalOpen && (
  <div
    className="modal-overlay"
    onClick={() => setIsLoginModalOpen(false)}
  >
    <div
      className="modal login-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="modal-header">
        <div>
          <h2>관리자 로그인</h2>
          <p>활동을 관리하려면 로그인해주세요.</p>
        </div>

        <button
          className="modal-close-button"
          onClick={() => setIsLoginModalOpen(false)}
        >
          ×
        </button>
      </div>

      <div className="login-form">
        <div className="form-field">
          <label>이메일</label>
          <input
            type="email"
            value={loginEmail}
            onChange={(event) =>
              setLoginEmail(event.target.value)
            }
            placeholder="관리자 이메일"
          />
        </div>

        <div className="form-field">
          <label>비밀번호</label>
          <input
            type="password"
            value={loginPassword}
            onChange={(event) =>
              setLoginPassword(event.target.value)
            }
            placeholder="비밀번호"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleAdminLogin()
              }
            }}
          />
        </div>

        {loginError && (
          <p className="login-error">
            {loginError}
          </p>
        )}
      </div>

      <div className="modal-actions">
        <button
          className="modal-cancel-button"
          onClick={() => setIsLoginModalOpen(false)}
        >
          취소
        </button>

        <button
          className="modal-save-button"
          type="button"
          onClick={handleAdminLogin}
        >
          로그인
        </button>
      </div>
    </div>
  </div>
)}


{isPasswordModalOpen && (
  <div
    className="modal-overlay"
    onClick={() => setIsPasswordModalOpen(false)}
  >
    <div
      className="modal login-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="modal-header">
        <div>
          <h2>비밀번호 변경</h2>
          <p>새 관리자 비밀번호를 입력해주세요.</p>
        </div>

        <button
          className="modal-close-button"
          onClick={() => setIsPasswordModalOpen(false)}
        >
          ×
        </button>
      </div>

      <div className="login-form">
        <div className="form-field">
          <label>새 비밀번호</label>
          <input
            type="password"
            value={newPassword}
            onChange={(event) =>
              setNewPassword(event.target.value)
            }
          />
        </div>

        <div className="form-field">
          <label>새 비밀번호 확인</label>
          <input
            type="password"
            value={newPasswordConfirm}
            onChange={(event) =>
              setNewPasswordConfirm(event.target.value)
            }
          />
        </div>
      </div>

      <div className="modal-actions">
        <button
          className="modal-cancel-button"
          onClick={() => setIsPasswordModalOpen(false)}
        >
          취소
        </button>

        <button
          className="modal-save-button"
          type="button"
          onClick={handleChangePassword}
        >
          변경
        </button>
      </div>
    </div>
  </div>
)}

{previewImageUrl && (
  <div
    className="modal-overlay"
    onClick={() => setPreviewImageUrl(null)}
  >
    <div
      className="image-preview-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        className="image-preview-close"
        onClick={() => setPreviewImageUrl(null)}
      >
        ×
      </button>

      <img
        src={previewImageUrl}
        alt="증빙 이미지"
      />
    </div>
  </div>
)}


    </div>
  )
}

export default App
import {
  useEffect,
  useMemo,
  useState,
  type ClipboardEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { API_URL } from "./api";

type Priority = "Low" | "Medium" | "High";
type FilterType = "All" | "Active" | "Completed" | "High";

type TaskItem = {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  priority: Priority;
  dueDate: string | null;
  createdAt: string;
};

function App() {
  const getToday = () => {
    const todayDate = new Date();
    const year = todayDate.getFullYear();
    const month = String(todayDate.getMonth() + 1).padStart(2, "0");
    const day = String(todayDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const today = getToday();

  const openDatePicker = (
    event: MouseEvent<HTMLInputElement> | FocusEvent<HTMLInputElement>
  ) => {
    const input = event.currentTarget as HTMLInputElement & {
      showPicker?: () => void;
    };

    input.showPicker?.();
  };

  const preventManualDateInput = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Tab") {
      event.preventDefault();
    }
  };

  const preventDatePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
  };

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [dueDate, setDueDate] = useState("");

  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("Medium");
  const [editDueDate, setEditDueDate] = useState("");

  const [filter, setFilter] = useState<FilterType>("All");
  const [isLoading, setIsLoading] = useState(false);

  const completedCount = useMemo(
    () => tasks.filter((task) => task.isCompleted).length,
    [tasks]
  );

  const activeCount = tasks.length - completedCount;

  const highPriorityCount = tasks.filter(
    (task) => task.priority === "High"
  ).length;

  const filteredTasks = useMemo(() => {
    if (filter === "Active") {
      return tasks.filter((task) => !task.isCompleted);
    }

    if (filter === "Completed") {
      return tasks.filter((task) => task.isCompleted);
    }

    if (filter === "High") {
      return tasks.filter((task) => task.priority === "High");
    }

    return tasks;
  }, [tasks, filter]);

  const getFilterLabel = (filterItem: FilterType) => {
    if (filterItem === "All") return "Tümü";
    if (filterItem === "Active") return "Aktif";
    if (filterItem === "Completed") return "Tamamlanan";
    return "Yüksek Öncelik";
  };

  const getPriorityLabel = (taskPriority: Priority) => {
    if (taskPriority === "High") return "Yüksek";
    if (taskPriority === "Medium") return "Orta";
    return "Düşük";
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Görevler getirilemedi:", error);
    }
  };

  const createTask = async () => {
    if (!title.trim()) {
      alert("Başlık alanı boş bırakılamaz.");
      return;
    }

    if (dueDate && dueDate < today) {
      alert("Geçmiş bir tarih seçilemez.");
      return;
    }

    const newTask = {
      title,
      description,
      isCompleted: false,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    };

    try {
      setIsLoading(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Görev ekleme hatası:", response.status, errorText);
        alert(`Görev eklenemedi. Hata kodu: ${response.status}`);
        return;
      }

      setTitle("");
      setDescription("");
      setPriority("Medium");
      setDueDate("");

      await fetchTasks();
    } catch (error) {
      console.error("Görev eklenemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskStatus = async (task: TaskItem) => {
    const updatedTask = {
      ...task,
      isCompleted: !task.isCompleted,
    };

    try {
      await fetch(`${API_URL}/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      });

      await fetchTasks();
    } catch (error) {
      console.error("Görev durumu güncellenemedi:", error);
    }
  };

  const startEditing = (task: TaskItem) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditPriority(task.priority || "Medium");
    setEditDueDate(task.dueDate ? task.dueDate.substring(0, 10) : "");
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setEditTitle("");
    setEditDescription("");
    setEditPriority("Medium");
    setEditDueDate("");
  };

  const updateTask = async () => {
    if (!editingTask) {
      return;
    }

    if (!editTitle.trim()) {
      alert("Başlık alanı boş bırakılamaz.");
      return;
    }

    if (editDueDate && editDueDate < today) {
      alert("Geçmiş bir tarih seçilemez.");
      return;
    }

    const updatedTask = {
      ...editingTask,
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
    };

    try {
      const response = await fetch(`${API_URL}/${editingTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Görev güncelleme hatası:", response.status, errorText);
        alert(`Görev güncellenemedi. Hata kodu: ${response.status}`);
        return;
      }

      cancelEditing();
      await fetchTasks();
    } catch (error) {
      console.error("Görev güncellenemedi:", error);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      await fetchTasks();
    } catch (error) {
      console.error("Görev silinemedi:", error);
    }
  };

  const getPriorityBadgeClass = (taskPriority: Priority) => {
    if (taskPriority === "High") {
      return "bg-pastel-rose text-pastel-rose-deep";
    }

    if (taskPriority === "Medium") {
      return "bg-pastel-lemon text-pastel-lemon-deep";
    }

    return "bg-pastel-mint text-pastel-mint-deep";
  };

  const getStatusBadgeClass = (isCompleted: boolean) => {
    return isCompleted
      ? "bg-pastel-mint text-pastel-mint-deep"
      : "bg-pastel-sky text-pastel-sky-deep";
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <main className="pastel-bg min-h-screen px-5 py-10 text-purple-950">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 rounded-3xl border border-pastel-lavender/60 bg-pastel-cream/80 p-8 shadow-pastel backdrop-blur-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pastel-pink via-pastel-lavender to-pastel-sky p-0.5 shadow-pastel-sm">
                <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-pastel-cream/90">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-9 w-9"
                    viewBox="0 0 48 48"
                    fill="none"
                  >
                    <defs>
                      <linearGradient
                        id="logoGrad1"
                        x1="8"
                        y1="8"
                        x2="40"
                        y2="40"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#E8A0C0" />
                        <stop offset="0.5" stopColor="#A88FD4" />
                        <stop offset="1" stopColor="#7BB8E8" />
                      </linearGradient>
                      <linearGradient
                        id="logoGrad2"
                        x1="14"
                        y1="20"
                        x2="34"
                        y2="36"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#6BC4A0" />
                        <stop offset="1" stopColor="#D4B85C" />
                      </linearGradient>
                    </defs>
                    <rect
                      x="10"
                      y="6"
                      width="28"
                      height="36"
                      rx="4"
                      fill="url(#logoGrad1)"
                      fillOpacity="0.25"
                      stroke="url(#logoGrad1)"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 18h16M18 24h12M18 30h14"
                      stroke="url(#logoGrad1)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="34"
                      cy="34"
                      r="8"
                      fill="url(#logoGrad2)"
                      fillOpacity="0.35"
                      stroke="url(#logoGrad2)"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M31 34l2.5 2.5L37 31"
                      stroke="#5A9E7E"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <h1 className="bg-gradient-to-r from-pastel-rose-deep via-pastel-lavender-deep to-pastel-sky-deep bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-4xl">
                Görev Takip Sistemi
              </h1>
            </div>

            <p className="text-lg leading-8 text-purple-950">
              Görevlerinizi oluşturabilir, öncelik ve son tarih bilgisiyle takip
              edebilir, tamamlanma durumlarını güncelleyebilirsiniz.
            </p>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-pastel-lavender/50 bg-pastel-lavender/40 p-6 shadow-pastel-sm">
            <p className="text-sm font-medium text-pastel-lavender-deep">
              Toplam Görev
            </p>
            <p className="mt-3 text-4xl font-bold text-pastel-lavender-deep">
              {tasks.length}
            </p>
          </div>

          <div className="rounded-2xl border border-pastel-sky/50 bg-pastel-sky/40 p-6 shadow-pastel-sm">
            <p className="text-sm font-medium text-pastel-sky-deep">Aktif Görev</p>
            <p className="mt-3 text-4xl font-bold text-pastel-sky-deep">
              {activeCount}
            </p>
          </div>

          <div className="rounded-2xl border border-pastel-mint/50 bg-pastel-mint/40 p-6 shadow-pastel-sm">
            <p className="text-sm font-medium text-pastel-mint-deep">
              Tamamlanan
            </p>
            <p className="mt-3 text-4xl font-bold text-pastel-mint-deep">
              {completedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-pastel-rose/50 bg-pastel-rose/40 p-6 shadow-pastel-sm">
            <p className="text-sm font-medium text-pastel-rose-deep">
              Yüksek Öncelik
            </p>
            <p className="mt-3 text-4xl font-bold text-pastel-rose-deep">
              {highPriorityCount}
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-pastel-peach/50 bg-pastel-cream/70 p-6 shadow-pastel backdrop-blur-sm md:p-8">
          <h2 className="mb-6 text-2xl font-semibold text-pastel-peach-deep">
            Yeni Görev
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="rounded-2xl border border-pastel-lavender/60 bg-white/70 px-4 py-3 text-purple-950 outline-none transition placeholder:text-purple-950 focus:border-pastel-lavender-deep focus:ring-4 focus:ring-pastel-lavender/40"
              type="text"
              placeholder="Görev başlığı"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            <input
              className="rounded-2xl border border-pastel-lavender/60 bg-white/70 px-4 py-3 text-purple-950 outline-none transition placeholder:text-purple-950 focus:border-pastel-lavender-deep focus:ring-4 focus:ring-pastel-lavender/40"
              type="text"
              placeholder="Görev açıklaması"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            <select
              className="rounded-2xl border border-pastel-lavender/60 bg-white/70 px-4 py-3 text-purple-950 outline-none transition focus:border-pastel-lavender-deep focus:ring-4 focus:ring-pastel-lavender/40"
              value={priority}
              onChange={(event) => setPriority(event.target.value as Priority)}
            >
              <option value="Low">Düşük Öncelik</option>
              <option value="Medium">Orta Öncelik</option>
              <option value="High">Yüksek Öncelik</option>
            </select>

            <input
              className="cursor-pointer rounded-2xl border border-pastel-lavender/60 bg-white/70 px-4 py-3 text-purple-950 outline-none transition focus:border-pastel-lavender-deep focus:ring-4 focus:ring-pastel-lavender/40"
              type="date"
              min={today}
              value={dueDate}
              onClick={openDatePicker}
              onFocus={openDatePicker}
              onKeyDown={preventManualDateInput}
              onPaste={preventDatePaste}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>

          <button
            className="mt-5 rounded-2xl bg-gradient-to-r from-pastel-lavender-deep to-pastel-sky-deep px-6 py-3 font-semibold text-white shadow-pastel-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={createTask}
            disabled={isLoading}
          >
            {isLoading ? "Ekleniyor..." : "Görev Ekle"}
          </button>
        </section>

        <section className="rounded-3xl border border-pastel-sky/50 bg-pastel-cream/70 p-6 shadow-pastel backdrop-blur-sm md:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <h2 className="text-2xl font-semibold text-pastel-sky-deep">
              Görev Listesi
            </h2>

            <div className="flex flex-wrap gap-2">
              {(["All", "Active", "Completed", "High"] as FilterType[]).map(
                (filterItem) => (
                  <button
                    key={filterItem}
                    onClick={() => setFilter(filterItem)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      filter === filterItem
                        ? "bg-gradient-to-r from-pastel-lavender-deep to-pastel-sky-deep text-white shadow-pastel-sm"
                        : "border border-pastel-lavender/40 bg-pastel-lavender/30 text-pastel-lavender-deep hover:bg-pastel-lavender/50"
                    }`}
                  >
                    {getFilterLabel(filterItem)}
                  </button>
                )
              )}
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-pastel-lavender/50 bg-pastel-lavender/20 p-10 text-center">
              <p className="text-lg font-semibold text-pastel-lavender-deep">
                Henüz görev bulunmuyor.
              </p>

              <p className="mt-2 text-sm text-purple-950">
                Yeni bir görev ekleyerek başlayabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-pastel-pink/40 bg-white/50 p-5 shadow-pastel-sm transition hover:border-pastel-lavender/60 hover:bg-pastel-lavender/10"
                >
                  {editingTask?.id === task.id ? (
                    <div className="grid gap-4">
                      <input
                        className="rounded-xl border border-pastel-lavender/60 bg-white/70 px-4 py-3 text-purple-950 outline-none focus:border-pastel-lavender-deep focus:ring-4 focus:ring-pastel-lavender/40"
                        value={editTitle}
                        onChange={(event) => setEditTitle(event.target.value)}
                      />

                      <input
                        className="rounded-xl border border-pastel-lavender/60 bg-white/70 px-4 py-3 text-purple-950 outline-none focus:border-pastel-lavender-deep focus:ring-4 focus:ring-pastel-lavender/40"
                        value={editDescription}
                        onChange={(event) =>
                          setEditDescription(event.target.value)
                        }
                      />

                      <div className="grid gap-4 md:grid-cols-2">
                        <select
                          className="rounded-xl border border-pastel-lavender/60 bg-white/70 px-4 py-3 text-purple-950 outline-none focus:border-pastel-lavender-deep focus:ring-4 focus:ring-pastel-lavender/40"
                          value={editPriority}
                          onChange={(event) =>
                            setEditPriority(event.target.value as Priority)
                          }
                        >
                          <option value="Low">Düşük Öncelik</option>
                          <option value="Medium">Orta Öncelik</option>
                          <option value="High">Yüksek Öncelik</option>
                        </select>

                        <input
                          className="cursor-pointer rounded-xl border border-pastel-lavender/60 bg-white/70 px-4 py-3 text-purple-950 outline-none focus:border-pastel-lavender-deep focus:ring-4 focus:ring-pastel-lavender/40"
                          type="date"
                          min={today}
                          value={editDueDate}
                          onClick={openDatePicker}
                          onFocus={openDatePicker}
                          onKeyDown={preventManualDateInput}
                          onPaste={preventDatePaste}
                          onChange={(event) =>
                            setEditDueDate(event.target.value)
                          }
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          className="rounded-xl bg-pastel-mint-deep px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                          onClick={updateTask}
                        >
                          Kaydet
                        </button>

                        <button
                          className="rounded-xl bg-pastel-lavender/50 px-4 py-2 text-sm font-medium text-pastel-lavender-deep transition hover:bg-pastel-lavender/70"
                          onClick={cancelEditing}
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                              task.isCompleted
                            )}`}
                          >
                            {task.isCompleted ? "Tamamlandı" : "Aktif"}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityBadgeClass(
                              task.priority || "Medium"
                            )}`}
                          >
                            {getPriorityLabel(task.priority || "Medium")} Öncelik
                          </span>
                        </div>

                        <h3
                          className={`text-xl font-semibold ${
                            task.isCompleted
                              ? "text-purple-500/70 line-through"
                              : "text-purple-950"
                          }`}
                        >
                          {task.title}
                        </h3>

                        <p className="mt-2 max-w-2xl text-purple-950">
                          {task.description || "Açıklama girilmedi."}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-purple-900/80">
                          <span>
                            Oluşturulma:{" "}
                            {new Date(task.createdAt).toLocaleString("tr-TR")}
                          </span>

                          <span>
                            Son tarih:{" "}
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString(
                                  "tr-TR"
                                )
                              : "Belirtilmedi"}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          className="rounded-xl bg-pastel-mint/60 px-4 py-2 text-sm font-medium text-pastel-mint-deep transition hover:bg-pastel-mint/80"
                          onClick={() => toggleTaskStatus(task)}
                        >
                          {task.isCompleted ? "Geri Al" : "Tamamla"}
                        </button>

                        <button
                          className="rounded-xl bg-pastel-sky/60 px-4 py-2 text-sm font-medium text-pastel-sky-deep transition hover:bg-pastel-sky/80"
                          onClick={() => startEditing(task)}
                        >
                          Düzenle
                        </button>

                        <button
                          className="rounded-xl bg-pastel-rose/60 px-4 py-2 text-sm font-medium text-pastel-rose-deep transition hover:bg-pastel-rose/80"
                          onClick={() => deleteTask(task.id)}
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
import { useEffect, useState } from "react";
import { API_URL } from "./api";

type TaskItem = {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
};

function App() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Tasks could not be fetched:", error);
    }
  };

  const createTask = async () => {
    if (!title.trim()) {
      alert("Başlık alanı boş bırakılamaz.");
      return;
    }

    const newTask = {
      title,
      description,
      isCompleted: false,
    };

    try {
      setIsLoading(true);

      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      setTitle("");
      setDescription("");
      await fetchTasks();
    } catch (error) {
      console.error("Task could not be created:", error);
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
      console.error("Task could not be updated:", error);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      await fetchTasks();
    } catch (error) {
      console.error("Task could not be deleted:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <section className="mb-8 rounded-2xl bg-white p-8 shadow">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
            Full Stack POC
          </p>

          <h1 className="mb-3 text-4xl font-bold text-slate-900">
            Mini Task Tracker
          </h1>

          <p className="text-slate-600">
            React, TypeScript, Tailwind CSS, .NET Web API, PostgreSQL ve Docker Compose
            kullanılarak hazırlanmış uçtan uca CRUD örneği.
          </p>
        </section>

        <section className="mb-8 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-semibold text-slate-800">
            Yeni Görev Ekle
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              type="text"
              placeholder="Görev başlığı"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            <input
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              type="text"
              placeholder="Görev açıklaması"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <button
            className="mt-4 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
            onClick={createTask}
            disabled={isLoading}
          >
            {isLoading ? "Ekleniyor..." : "Görev Ekle"}
          </button>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-800">
              Görev Listesi
            </h2>

            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
              Toplam: {tasks.length}
            </span>
          </div>

          {tasks.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-4 text-slate-500">
              Henüz görev eklenmedi.
            </p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-5 md:flex-row md:items-center"
                >
                  <div>
                    <h3
                      className={`text-lg font-semibold ${
                        task.isCompleted
                          ? "text-green-700 line-through"
                          : "text-slate-900"
                      }`}
                    >
                      {task.title}
                    </h3>

                    <p className="mt-1 text-slate-600">
                      {task.description || "Açıklama girilmedi."}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      Oluşturulma tarihi:{" "}
                      {new Date(task.createdAt).toLocaleString("tr-TR")}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
                      onClick={() => toggleTaskStatus(task)}
                    >
                      {task.isCompleted ? "Geri Al" : "Tamamla"}
                    </button>

                    <button
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                      onClick={() => deleteTask(task.id)}
                    >
                      Sil
                    </button>
                  </div>
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
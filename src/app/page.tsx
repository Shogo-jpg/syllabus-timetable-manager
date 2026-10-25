"use client";

import { FormEvent, useEffect, useState } from "react";

type Course = {
  id: number;
  name: string;
  instructor: string;
  day: string;
  period: number;
  color: string;
};

type SlotChoice = { day: string; period: number };

const weekdays = ["月", "火", "水", "木", "金"];
const periods = [1, 2, 3, 4, 5];
const colors = ["lavender", "mint", "peach", "blue", "rose"];
const storageKey = "syllabus-note-courses-v1";

function isOccupied(courses: Course[], day: string, period: number) {
  return courses.some((course) => course.day === day && course.period === period);
}

function firstAvailableSlot(courses: Course[]): SlotChoice | null {
  for (const period of periods) {
    for (const day of weekdays) {
      if (!isOccupied(courses, day, period)) return { day, period };
    }
  }
  return null;
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotChoice>({ day: "月", period: 1 });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    try {
      const savedCourses = window.localStorage.getItem(storageKey);
      if (savedCourses) {
        const parsed: unknown = JSON.parse(savedCourses);
        if (Array.isArray(parsed)) setCourses(parsed as Course[]);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (storageReady) window.localStorage.setItem(storageKey, JSON.stringify(courses));
  }, [courses, storageReady]);

  function openForm(slot?: SlotChoice) {
    const available = firstAvailableSlot(courses);
    setSelectedSlot(slot ?? available ?? { day: "月", period: 1 });
    setFormError(available ? "" : "登録できる空きコマがありません。");
    setShowForm(true);
  }

  function addCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name")).trim();
    if (!name) return;
    if (isOccupied(courses, selectedSlot.day, selectedSlot.period)) {
      setFormError("この時間帯にはすでに授業があります。別の空きコマを選んでください。");
      return;
    }
    setCourses((current) => [
      ...current,
      {
        id: Date.now(),
        name,
        instructor: String(form.get("instructor")).trim(),
        day: selectedSlot.day,
        period: selectedSlot.period,
        color: colors[current.length % colors.length],
      },
    ]);
    event.currentTarget.reset();
    setFormError("");
    setShowForm(false);
  }

  function chooseDay(day: string) {
    const openPeriod = periods.find((period) => !isOccupied(courses, day, period));
    if (openPeriod) {
      setSelectedSlot({ day, period: openPeriod });
      setFormError("");
    } else {
      setFormError(`${day}曜日に空きコマはありません。別の曜日を選んでください。`);
    }
  }

  function removeCourse(id: number) {
    setCourses((current) => current.filter((course) => course.id !== id));
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="シラバスノート ホーム">
          <span className="brand-mark">S</span>
          <span>シラバスノート</span>
        </a>
        <span className="term-pill"><span className="status-dot" /> 2026年度 · 秋学期</span>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow">MY CAMPUS, IN ONE PLACE</p>
          <h1>今学期の時間割</h1>
          <p className="intro-copy">授業の予定も、大切な情報も、ここにまとめて。</p>
        </div>
        <button className="primary-button" onClick={() => openForm()} disabled={!firstAvailableSlot(courses)}>
          <span aria-hidden="true">＋</span> 授業を追加
        </button>
      </section>

      {showForm && (
        <form className="course-form" onSubmit={addCourse}>
          <div className="form-heading">
            <div><p className="eyebrow">NEW CLASS</p><h2>授業を登録</h2></div>
            <button type="button" className="close-button" onClick={() => setShowForm(false)} aria-label="閉じる">×</button>
          </div>
          <label>授業名<input name="name" placeholder="例：データベース基礎" required autoFocus /></label>
          <label>担当教員<input name="instructor" placeholder="例：山田先生" /></label>
          <div className="form-row">
            <label>曜日
              <select name="day" value={selectedSlot.day} onChange={(event) => chooseDay(event.target.value)}>
                {weekdays.map((day) => (
                  <option key={day} value={day} disabled={!periods.some((period) => !isOccupied(courses, day, period))}>
                    {day}曜日
                  </option>
                ))}
              </select>
            </label>
            <label>時限
              <select
                name="period"
                value={selectedSlot.period}
                onChange={(event) => setSelectedSlot((current) => ({ ...current, period: Number(event.target.value) }))}
              >
                {periods.map((period) => (
                  <option key={period} value={period} disabled={isOccupied(courses, selectedSlot.day, period)}>{period}限</option>
                ))}
              </select>
            </label>
          </div>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <button className="primary-button submit-button" type="submit" disabled={!firstAvailableSlot(courses)}>時間割に追加</button>
        </form>
      )}

      <section className="schedule-card" aria-label="週間時間割">
        <div className="schedule-scroll">
          <div className="schedule-grid">
            <div className="grid-corner" />
            {weekdays.map((day) => <div className="day-heading" key={day}><span>{day}</span><small>曜日</small></div>)}
            {periods.map((period) => (
              <div className="schedule-row" key={period}>
                <div className="period-heading"><strong>{period}</strong><span>時限</span></div>
                {weekdays.map((day) => {
                  const course = courses.find((item) => item.day === day && item.period === period);
                  return <div className="slot" key={`${day}-${period}`}>
                    {course ? (
                      <article className={`course-card ${course.color}`}>
                        <span className="course-time">{period}限 · {day}</span>
                        <button className="remove-course" type="button" onClick={() => removeCourse(course.id)} aria-label={`${course.name}を削除`}>×</button>
                        <h3>{course.name}</h3>
                        {course.instructor && <p>{course.instructor}</p>}
                      </article>
                    ) : (
                      <button className="add-slot" type="button" onClick={() => openForm({ day, period })} aria-label={`${day}曜日${period}限に授業を追加`}>
                        <span aria-hidden="true">＋</span><span>追加</span>
                      </button>
                    )}
                  </div>;
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="schedule-footer">
          <span><span className="status-dot" /> {courses.length} / {weekdays.length * periods.length} 授業を登録済み</span>
          <span>{storageReady ? "この端末に自動保存されます" : "保存データを読み込み中…"}</span>
        </div>
      </section>

      <section className="next-step">
        <div className="next-icon">✳</div>
        <div><p className="eyebrow">YOUR SEMESTER, ORGANIZED</p><h2>シラバス情報も、ここに集約。</h2><p>出席要件や評価方法、課題の予定もまとめて管理できるようにしていきます。</p></div>
        <span className="next-arrow" aria-hidden="true">↗</span>
      </section>
      <footer>シラバスノート <span>·</span> 学びの毎日を、少し軽やかに。</footer>
    </main>
  );
}

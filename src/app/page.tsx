"use client";

import { FormEvent, useState } from "react";

type Course = {
  id: number;
  name: string;
  instructor: string;
  day: string;
  period: string;
  color: string;
};

const weekdays = ["月", "火", "水", "木", "金"];
const periods = [1, 2, 3, 4, 5];
const colors = ["lavender", "mint", "peach", "blue", "rose"];

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);

  function addCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const day = String(form.get("day"));
    const period = String(form.get("period"));
    const name = String(form.get("name")).trim();
    if (!name) return;
    setCourses((current) => [
      ...current,
      {
        id: Date.now(),
        name,
        instructor: String(form.get("instructor")).trim(),
        day,
        period,
        color: colors[current.length % colors.length],
      },
    ]);
    event.currentTarget.reset();
    setShowForm(false);
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
        <button className="primary-button" onClick={() => setShowForm((open) => !open)}>
          <span aria-hidden="true">＋</span> 授業を追加
        </button>
      </section>

      {showForm && (
        <form className="course-form" onSubmit={addCourse}>
          <div className="form-heading"><div><p className="eyebrow">NEW CLASS</p><h2>授業を登録</h2></div><button type="button" className="close-button" onClick={() => setShowForm(false)} aria-label="閉じる">×</button></div>
          <label>授業名<input name="name" placeholder="例：データベース基礎" required /></label>
          <label>担当教員<input name="instructor" placeholder="例：山田先生" /></label>
          <div className="form-row">
            <label>曜日<select name="day">{weekdays.map((day) => <option key={day}>{day}</option>)}</select></label>
            <label>時限<select name="period">{periods.map((period) => <option key={period}>{period}</option>)}</select></label>
          </div>
          <button className="primary-button submit-button" type="submit">時間割に追加</button>
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
                  const course = courses.find((item) => item.day === day && item.period === String(period));
                  return <div className="slot" key={`${day}-${period}`}>
                    {course && <article className={`course-card ${course.color}`}><span className="course-time">{period}限 · {day}</span><h3>{course.name}</h3>{course.instructor && <p>{course.instructor}</p>}</article>}
                  </div>;
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="schedule-footer"><span><span className="status-dot" /> {courses.length} 授業を登録済み</span><span>授業を追加して時間割をつくりましょう</span></div>
      </section>

      <section className="next-step">
        <div className="next-icon">✳</div>
        <div><p className="eyebrow">YOUR SEMESTER, ORGANIZED</p><h2>シラバス情報も、ここに集約。</h2><p>授業を登録すると、出席要件や評価方法、課題の予定もまとめて管理できるようになります。</p></div>
        <span className="next-arrow" aria-hidden="true">↗</span>
      </section>
      <footer>シラバスノート <span>·</span> 学びの毎日を、少し軽やかに。</footer>
    </main>
  );
}

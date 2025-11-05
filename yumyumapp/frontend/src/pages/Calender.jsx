import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [comments, setComments] = useState(() => {
    // Load comments from localStorage on component mount
    const savedComments = localStorage.getItem('calendarComments');
    return savedComments ? JSON.parse(savedComments) : {};
  });
  const [newComment, setNewComment] = useState('');

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    // Load comment for today if it exists
    const dateKey = today.toISOString().split('T')[0];
    setNewComment(comments[dateKey] || '');
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    if (!day || !selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleDateClick = (day) => {
    if (day) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      setSelectedDate(date);
      // Load comment for this date if it exists
      const dateKey = date.toISOString().split('T')[0];
      setNewComment(comments[dateKey] || '');
    }
  };

  const handleSaveComment = () => {
    if (selectedDate) {
      const dateKey = selectedDate.toISOString().split('T')[0];
      const updatedComments = {
        ...comments,
        [dateKey]: newComment.trim(),
      };
      setComments(updatedComments);
      // Save to localStorage
      localStorage.setItem('calendarComments', JSON.stringify(updatedComments));
      // Clear comment if it was empty (removing comment)
      if (!newComment.trim()) {
        setNewComment('');
      }
    }
  };

  const handleDeleteComment = () => {
    if (selectedDate) {
      const dateKey = selectedDate.toISOString().split('T')[0];
      const updatedComments = { ...comments };
      delete updatedComments[dateKey];
      setComments(updatedComments);
      localStorage.setItem('calendarComments', JSON.stringify(updatedComments));
      setNewComment('');
    }
  };

  const getCommentForDate = (date) => {
    if (!date) return '';
    const dateKey = date.toISOString().split('T')[0];
    return comments[dateKey] || '';
  };

  const hasComment = (day) => {
    if (!day) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = date.toISOString().split('T')[0];
    return !!comments[dateKey];
  };

  const days = getDaysInMonth(currentDate);
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const calendarStyles = {
    container: {
      maxWidth: "1000px",
      margin: "0 auto",
      padding: "2rem",
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "2rem",
      paddingBottom: "1rem",
      borderBottom: "2px solid #e2e8f0",
    },
    title: {
      fontSize: "2rem",
      fontWeight: "700",
      color: "#1e293b",
      margin: 0,
    },
    nav: {
      display: "flex",
      gap: "1rem",
      alignItems: "center",
    },
    navLink: {
      color: "#64748b",
      textDecoration: "none",
      fontSize: "0.9rem",
      transition: "color 0.2s",
      padding: "0.5rem 1rem",
      borderRadius: "6px",
    },
    calendarContainer: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      padding: "1.5rem",
      marginBottom: "2rem",
    },
    calendarHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1.5rem",
      paddingBottom: "1rem",
      borderBottom: "1px solid #e2e8f0",
    },
    monthYear: {
      fontSize: "1.5rem",
      fontWeight: "600",
      color: "#1e293b",
    },
    navigationButtons: {
      display: "flex",
      gap: "0.5rem",
    },
    navButton: {
      padding: "0.5rem 1rem",
      backgroundColor: "#f1f5f9",
      color: "#475569",
      border: "1px solid #e2e8f0",
      borderRadius: "6px",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    navButtonHover: {
      backgroundColor: "#e2e8f0",
    },
    todayButton: {
      padding: "0.5rem 1rem",
      backgroundColor: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    weekdays: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: "0.5rem",
      marginBottom: "0.5rem",
    },
    weekday: {
      textAlign: "center",
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#64748b",
      padding: "0.5rem",
    },
    daysGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: "0.5rem",
    },
    dayCell: {
      aspectRatio: "1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.875rem",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.2s",
      backgroundColor: "#fff",
      border: "1px solid transparent",
    },
    dayCellEmpty: {
      cursor: "default",
      backgroundColor: "transparent",
    },
    dayCellNormal: {
      color: "#1e293b",
      backgroundColor: "#f8fafc",
    },
    dayCellHover: {
      backgroundColor: "#e2e8f0",
      transform: "scale(1.05)",
    },
    dayCellToday: {
      backgroundColor: "#2563eb",
      color: "white",
      fontWeight: "600",
      border: "2px solid #1d4ed8",
    },
    dayCellSelected: {
      backgroundColor: "#3b82f6",
      color: "white",
      fontWeight: "600",
      boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)",
    },
    dayCellWithComment: {
      position: "relative",
    },
    commentIndicator: {
      position: "absolute",
      top: "4px",
      right: "4px",
      width: "6px",
      height: "6px",
      backgroundColor: "#10b981",
      borderRadius: "50%",
      border: "1px solid white",
    },
    selectedDateInfo: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      padding: "1.5rem",
    },
    selectedDateTitle: {
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "#1e293b",
      marginBottom: "1rem",
    },
    selectedDateContent: {
      color: "#64748b",
      fontSize: "0.875rem",
    },
    noSelection: {
      textAlign: "center",
      color: "#94a3b8",
      padding: "2rem",
      fontSize: "0.875rem",
    },
    commentSection: {
      marginTop: "1rem",
      paddingTop: "1rem",
      borderTop: "1px solid #e2e8f0",
    },
    commentLabel: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#475569",
      marginBottom: "0.5rem",
    },
    commentTextarea: {
      width: "100%",
      minHeight: "100px",
      padding: "0.75rem",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      fontSize: "0.875rem",
      fontFamily: "inherit",
      resize: "vertical",
      transition: "all 0.2s",
      backgroundColor: "#fff",
    },
    commentButtons: {
      display: "flex",
      gap: "0.5rem",
      marginTop: "0.75rem",
    },
    saveButton: {
      padding: "0.5rem 1rem",
      backgroundColor: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    deleteButton: {
      padding: "0.5rem 1rem",
      backgroundColor: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    existingComment: {
      backgroundColor: "#f8fafc",
      padding: "0.75rem",
      borderRadius: "8px",
      marginBottom: "0.75rem",
      fontSize: "0.875rem",
      color: "#1e293b",
      lineHeight: "1.5",
      whiteSpace: "pre-wrap",
    },
  };

  const [hoveredDay, setHoveredDay] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);

  return (
    <div style={calendarStyles.container}>
      <div style={calendarStyles.header}>
        <h1 style={calendarStyles.title}>📅 Calendar</h1>
        <nav style={calendarStyles.nav}>
          <Link to="/home" style={calendarStyles.navLink}>Home</Link>
          <span style={{ color: "#cbd5e1" }}>|</span>
          <Link to="/fridge" style={calendarStyles.navLink}>Fridge</Link>
        </nav>
      </div>

      <div style={calendarStyles.calendarContainer}>
        <div style={calendarStyles.calendarHeader}>
          <div style={calendarStyles.monthYear}>
            {monthNames[currentMonth]} {currentYear}
          </div>
          <div style={calendarStyles.navigationButtons}>
            <button
              onClick={goToPreviousMonth}
              style={{
                ...calendarStyles.navButton,
                ...(hoveredButton === 'prev' ? calendarStyles.navButtonHover : {})
              }}
              onMouseEnter={() => setHoveredButton('prev')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              ← Prev
            </button>
            <button
              onClick={goToToday}
              style={{
                ...calendarStyles.todayButton,
                ...(hoveredButton === 'today' ? { backgroundColor: "#1d4ed8" } : {})
              }}
              onMouseEnter={() => setHoveredButton('today')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              Today
            </button>
            <button
              onClick={goToNextMonth}
              style={{
                ...calendarStyles.navButton,
                ...(hoveredButton === 'next' ? calendarStyles.navButtonHover : {})
              }}
              onMouseEnter={() => setHoveredButton('next')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              Next →
            </button>
          </div>
        </div>

        <div style={calendarStyles.weekdays}>
          {dayNames.map((day) => (
            <div key={day} style={calendarStyles.weekday}>
              {day}
            </div>
          ))}
        </div>

        <div style={calendarStyles.daysGrid}>
          {days.map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  style={{ ...calendarStyles.dayCell, ...calendarStyles.dayCellEmpty }}
                />
              );
            }

            const isTodayDay = isToday(day);
            const isSelectedDay = isSelected(day);
            const isHovered = hoveredDay === day;
            const dayHasComment = hasComment(day);

            let dayStyle = {
              ...calendarStyles.dayCell,
              ...(isTodayDay ? calendarStyles.dayCellToday : {}),
              ...(isSelectedDay && !isTodayDay ? calendarStyles.dayCellSelected : {}),
              ...(!isTodayDay && !isSelectedDay ? calendarStyles.dayCellNormal : {}),
              ...(isHovered && !isTodayDay && !isSelectedDay ? calendarStyles.dayCellHover : {}),
              ...(dayHasComment ? calendarStyles.dayCellWithComment : {}),
            };

            return (
              <div
                key={day}
                style={dayStyle}
                onClick={() => handleDateClick(day)}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {day}
                {dayHasComment && (
                  <span style={calendarStyles.commentIndicator} title="Has comment"></span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={calendarStyles.selectedDateInfo}>
        <div style={calendarStyles.selectedDateTitle}>Selected Date</div>
        {selectedDate ? (
          <div style={calendarStyles.selectedDateContent}>
            <div style={{ marginBottom: "1rem" }}>
              <strong>Date:</strong> {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>

            <div style={calendarStyles.commentSection}>
              <div style={calendarStyles.commentLabel}>Comments & Notes</div>
              
              {getCommentForDate(selectedDate) && (
                <div style={calendarStyles.existingComment}>
                  {getCommentForDate(selectedDate)}
                </div>
              )}

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment or note for this date..."
                style={calendarStyles.commentTextarea}
                onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
              />

              <div style={calendarStyles.commentButtons}>
                <button
                  onClick={handleSaveComment}
                  style={{
                    ...calendarStyles.saveButton,
                    ...(hoveredButton === 'save' ? { backgroundColor: "#1d4ed8" } : {})
                  }}
                  onMouseEnter={() => setHoveredButton('save')}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  {getCommentForDate(selectedDate) ? '💾 Update Comment' : '💾 Save Comment'}
                </button>
                {getCommentForDate(selectedDate) && (
                  <button
                    onClick={handleDeleteComment}
                    style={{
                      ...calendarStyles.deleteButton,
                      ...(hoveredButton === 'delete' ? { backgroundColor: "#dc2626" } : {})
                    }}
                    onMouseEnter={() => setHoveredButton('delete')}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    🗑️ Delete Comment
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={calendarStyles.noSelection}>
            Click on a date to select it and add comments
          </div>
        )}
      </div>
    </div>
  );
}

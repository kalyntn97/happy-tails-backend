export function getCurrentDate() {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth, 0)

  const daysInMonth = lastDayOfMonth.getDate()
  const weeksInMonth = Math.ceil((daysInMonth + firstDayOfMonth.getDay()) / 7)
  
  return {
    currentDate,
    currentYear,
    currentMonth,
    daysInMonth, 
    weeksInMonth
  }
}
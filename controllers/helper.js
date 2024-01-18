export function getCurrentDate() {
  const today = new Date()
  const currentDate = today.getDate()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1

  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1)

  const firstDay = firstDayOfMonth.getDay()
  console.log(firstDay)
  
  const lastDayOfMonth = new Date(currentYear, currentMonth, 0)

  const daysInMonth = lastDayOfMonth.getDate()
  const weeksInMonth = Math.ceil((daysInMonth + firstDayOfMonth.getDay()) / 7)

  const daysPassed = currentDate - 1  
  const weeksPassed = Math.floor((daysPassed + firstDayOfMonth.getDay()) / 7)
  const currentWeek = weeksPassed + 1

  return {
    currentDate,
    currentYear,
    currentMonth,
    currentWeek,
    daysInMonth, 
    weeksInMonth,
    daysPassed,
    weeksPassed,
    firstDay
  }
}
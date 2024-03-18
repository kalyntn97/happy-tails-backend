export function getCurrentDate() {
  const today = new Date()
  const currentDate = today.getDate()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1

  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1)

  const firstDay = firstDayOfMonth.getDay()
  
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

export function getDateInfo(inputDate) {
  const date = inputDate.getDate()
  const month = inputDate.getMonth() + 1
  const year = inputDate.getFullYear()
  const firstDayOfMonth = new Date(year, month - 1, 1)

  const firstDay = firstDayOfMonth.getDay()
 
  const lastDayOfMonth = new Date(year, month, 0)

  const daysInMonth = lastDayOfMonth.getDate()
  const weeksInMonth = Math.ceil(daysInMonth / 7)

  const daysPassed = date - 1  
  const weeksPassed = Math.floor(daysPassed / 7)

  const week = weeksPassed + 1
  
  return {
    date, week, month, year, firstDay, daysInMonth, weeksInMonth
  }
}

export const isNewMonthYear = () => {
  const today = new Date()
  const month = today.getMonth() + 1
  const date = today.getDate()
  return {
    isNewMonth: date === 1,
    isNewYear: date === 1 && month === 1,
  }
}
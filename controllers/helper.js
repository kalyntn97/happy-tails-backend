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
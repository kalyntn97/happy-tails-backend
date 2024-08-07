export function getDateInfo(inputDate) {
  const date = inputDate.getDate()
  const month = inputDate.getMonth() + 1
  const year = inputDate.getFullYear()
  const firstDayOfMonth = new Date(year, month - 1, 1)
  const lastDayOfMonth = new Date(year, month, 0)
  const firstDayOfNextMonth = new Date(year, month, 1)

  const firstDay = firstDayOfMonth.getDay()
 

  const daysInMonth = lastDayOfMonth.getDate()
  const weeksInMonth = Math.ceil(daysInMonth / 7)

  const daysPassed = date - 1  
  const weeksPassed = Math.floor(daysPassed / 7)

  const week = weeksPassed + 1
  
  return {
    date, week, month, year, firstDay, daysInMonth, weeksInMonth, firstDayOfMonth, lastDayOfMonth, firstDayOfNextMonth
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

export const compareMonthYear = (date1, date2) => {
  const { month, year } = getDateInfo(date1)
  
  const { month: month2, year: year2 } = getDateInfo(date2)
  return {
    monthsPassed: month - month2,
    yearsPassed: year - year2,
    month, year
  }
}
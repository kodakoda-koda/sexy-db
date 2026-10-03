/** 生年月日(YYYY-MM-DD)から今日時点の満年齢を返す */
export function ageFrom(birthDate: string, today: Date = new Date()): number {
  const [y, m, d] = birthDate.split('-').map(Number)
  let age = today.getFullYear() - y
  const beforeBirthday =
    today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)
  if (beforeBirthday) age -= 1
  return Math.max(0, age)
}

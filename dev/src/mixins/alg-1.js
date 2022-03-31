const fn = function(ten, five, two, price) {
  function getSize(total, size, hasCount) {
    let count = 0
    if (total < size) return count
    while (total >= size && hasCount > count) {
      total -= size
      count++
    }
    return { count, total }
  }
  const tenRemain = getSize(price, 10, ten)
  price = tenRemain.total
  const fiveRemain = getSize(price, 5, five)
  price = fiveRemain.total
  const twoRemain = getSize(price, 2, two)
  price = twoRemain.total
  if (price === 0) {
    return `需要${tenRemain.count}张十元, ${fiveRemain.count}张五元, ${twoRemain.count}张两元`
  } else {
    return '不可凑齐'
  }
}
console.log(fn(1, 3, 3, 17))
console.log(fn(0, 3, 3, 17))
console.log(fn(0, 1, 30, 17))

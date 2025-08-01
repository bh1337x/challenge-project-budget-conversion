module.exports = function validateObject (object, rules) {
  const errors = {}

  for (const key in rules) {
    for (const rule of rules[key]) {
      if (!rule.test(object[key])) {
        errors[key] = rule.message
        break
      }
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}

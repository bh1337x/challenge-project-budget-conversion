/**
 * Validate an object against a schema
 * @param {Object} obj - The object to validate
 * @param {Object.<string, { fn: function(*): boolean, message: string }[]>}
 * rules - The schema to validate the object against
 * @returns {{ isValid: boolean, errors: Object.<string, string> }}
 * - The validation result
 */
function isObjectValid (obj, rules) {
  const errors = {}

  for (const key in rules) {
    for (const rule of rules[key]) {
      if (rule.fn(obj[key])) continue
      errors[key] = rule.message
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}

module.exports = isObjectValid

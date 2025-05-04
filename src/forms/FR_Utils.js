/** FormUtils.gs
 * Utility functions for modular form processing
 * Includes parsing, validation, and error logging
 */

/**
 * Parses form response items into a structured object
 * @param {Array} itemResponses - Array of FormItemResponse
 * @param {Object} fieldMap - Mapping of form question titles to internal field names
 * @returns {Object} Parsed field object
 */
function parseFields(itemResponses, fieldMap) {
  const parsed = {};
  itemResponses.forEach(item => {
    const question = item.getItem().getTitle();
    const answer = item.getResponse();
    if (fieldMap.hasOwnProperty(question)) {
      parsed[fieldMap[question]] = answer;
    }
  });
  return parsed;
}

/**
 * Validates and transforms parsed form data
 * @param {Object} data - Parsed field data
 * @param {Object} schema - Validation schema
 * @returns {Object} Object with validated data and an array of errors
 */
function validateFields(data, schema) {
  const errors = [];
  const validated = { ...data };

  for (const field in schema) {
    const rules = schema[field];
    const value = data[field];

    // Check required
    if (rules.required && (value === undefined || value === null || value === "")) {
      errors.push(`${field} is required.`);
      continue;
    }

    // Skip validation for empty optional fields
    if (!rules.required && (value === undefined || value === null || value === "")) {
      continue;
    }

    // Type validations
    switch (rules.type) {
      case "number":
        if (isNaN(parseFloat(value))) {
          errors.push(`${field} must be a valid number.`);
        } else {
          validated[field] = parseFloat(value);
        }
        break;

      case "date":
        const parsedDate = new Date(value);
        if (isNaN(parsedDate)) {
          errors.push(`${field} must be a valid date.`);
        } else {
          validated[field] = parsedDate;
        }
        break;

      case "lookup":
        if (rules.lookupFn) {
          const lookupResult = rules.lookupFn(value);
          if (!lookupResult) {
            errors.push(`Lookup failed for ${field}: '${value}'`);
          } else {
            validated[field + "Id"] = lookupResult;
          }
        }
        break;

      case "string":
        validated[field] = String(value).trim();
        break;

      // Extend with more types if needed
    }
  }

  return { data: validated, errors };
}

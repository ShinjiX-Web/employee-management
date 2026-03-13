function normalizeText(value) {
  return String(value || "").trim();
}

function nullable(value) {
  return value ? value : null;
}

function readRequiredText(form, key, label) {
  const value = normalizeText(form[key]);

  if (!value) {
    throw new Error(`${label} is required.`);
  }

  return value;
}

function readOptionalText(form, key) {
  return normalizeText(form[key]);
}

function readRequiredInteger(form, key, label) {
  const value = Number.parseInt(String(form[key] || ""), 10);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} must be a valid positive number.`);
  }

  return value;
}

function readOptionalIntegerField(form, key) {
  const parsed = Number.parseInt(String(form[key] || ""), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function readRequiredNumber(form, key, label) {
  const value = Number.parseFloat(String(form[key] || ""));

  if (Number.isNaN(value) || value < 0) {
    throw new Error(`${label} must be a valid non-negative number.`);
  }

  return value;
}

function readRequiredDate(form, key, label) {
  const value = readRequiredText(form, key, label);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must use the format YYYY-MM-DD.`);
  }

  return value;
}

function readOptionalDate(form, key, label) {
  const value = readOptionalText(form, key);

  if (!value) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must use the format YYYY-MM-DD.`);
  }

  return value;
}

function readRequiredTime(form, key, label) {
  const value = readRequiredText(form, key, label);

  if (!/^\d{2}:\d{2}$/.test(value)) {
    throw new Error(`${label} must use the format HH:MM.`);
  }

  return value;
}

function readOptionalTime(form, key, label) {
  const value = readOptionalText(form, key);

  if (!value) {
    return null;
  }

  if (!/^\d{2}:\d{2}$/.test(value)) {
    throw new Error(`${label} must use the format HH:MM.`);
  }

  return value;
}

function readOptionalEmail(form, key, label) {
  const value = readOptionalText(form, key);

  if (!value) {
    return null;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error(`${label} must be a valid email address.`);
  }

  return value;
}

function readRequiredChoice(form, key, label, validValues) {
  const value = readRequiredText(form, key, label);

  if (!validValues.includes(value)) {
    throw new Error(`${label} must be one of the allowed values.`);
  }

  return value;
}

function assertTimeRange(timeIn, timeOut) {
  if (timeOut && timeIn >= timeOut) {
    throw new Error("Time out must be later than time in.");
  }
}

function assertDateRange(startDate, endDate, label) {
  if (startDate && endDate && startDate > endDate) {
    throw new Error(`${label} must not be earlier than the start date.`);
  }
}

module.exports = {
  assertDateRange,
  assertTimeRange,
  normalizeText,
  nullable,
  readOptionalDate,
  readOptionalEmail,
  readOptionalIntegerField,
  readOptionalText,
  readOptionalTime,
  readRequiredChoice,
  readRequiredDate,
  readRequiredInteger,
  readRequiredNumber,
  readRequiredText,
  readRequiredTime
};

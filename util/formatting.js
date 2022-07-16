const slugToCamelCase = (string) => {
  const parts = string.split("_")
  const capitalizedParts = parts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))

  return parts[0] + capitalizedParts.slice(1).join("")
}

module.exports = { slugToCamelCase }
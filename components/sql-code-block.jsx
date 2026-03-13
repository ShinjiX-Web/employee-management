const sqlKeywords = new Set([
  "AND",
  "AS",
  "ASC",
  "AVG",
  "BETWEEN",
  "BY",
  "CASE",
  "COUNT",
  "CREATE",
  "DATE",
  "DELETE",
  "DESC",
  "DISTINCT",
  "ELSE",
  "END",
  "EXISTS",
  "FROM",
  "GROUP",
  "HAVING",
  "IN",
  "INNER",
  "INSERT",
  "INTO",
  "IS",
  "JOIN",
  "LEFT",
  "LIKE",
  "LIMIT",
  "MAX",
  "MIN",
  "NOT",
  "NULL",
  "ON",
  "OR",
  "ORDER",
  "OUTER",
  "RIGHT",
  "ROUND",
  "SELECT",
  "SET",
  "SUM",
  "THEN",
  "UNION",
  "UPDATE",
  "VALUES",
  "WHEN",
  "WHERE"
]);

const sqlFunctions = new Set([
  "AVG",
  "COALESCE",
  "COUNT",
  "DATE",
  "IFNULL",
  "LOWER",
  "MAX",
  "MIN",
  "ROUND",
  "STRFTIME",
  "SUM",
  "UPPER"
]);

const tokenPattern = /(--[^\n]*|'(?:''|[^'])*'|"(?:""|[^"])*"|<=|>=|<>|!=|[(),.;]|[-+/*%=<>]|\b\d+(?:\.\d+)?\b|\b[a-zA-Z_][a-zA-Z0-9_]*\b|\s+|.)/g;

function getNextMeaningfulToken(tokens, currentIndex) {
  for (let index = currentIndex + 1; index < tokens.length; index += 1) {
    if (!/^\s+$/.test(tokens[index])) {
      return tokens[index];
    }
  }

  return "";
}

function getTokenClass(token, nextToken) {
  const upperToken = token.toUpperCase();

  if (/^\s+$/.test(token)) {
    return null;
  }

  if (token.startsWith("--")) {
    return "text-slate-500";
  }

  if (/^['"]/.test(token)) {
    return "text-amber-300";
  }

  if (/^\d/.test(token)) {
    return "text-emerald-300";
  }

  if (sqlFunctions.has(upperToken) && nextToken === "(") {
    return "text-violet-300";
  }

  if (sqlKeywords.has(upperToken)) {
    return "font-semibold text-sky-300";
  }

  if (/^(<=|>=|<>|!=|[(),.;\-+/*%=<>])$/.test(token)) {
    return "text-slate-400";
  }

  if (token.includes("_id")) {
    return "text-cyan-300";
  }

  return "text-slate-100";
}

function SqlCodeBlock({ sql }) {
  const tokens = sql.trim().match(tokenPattern) || [];

  return (
    <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-100 shadow-inner">
      <code>
        {tokens.map((token, index) => {
          const tokenClassName = getTokenClass(token, getNextMeaningfulToken(tokens, index));

          if (!tokenClassName) {
            return token;
          }

          return (
            <span className={tokenClassName} key={`${token}-${index}`}>
              {token}
            </span>
          );
        })}
      </code>
    </pre>
  );
}

export default SqlCodeBlock;

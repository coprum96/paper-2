import fs from 'node:fs'
import path from 'node:path'

function parseCsv(text) {
  // Minimal CSV parser with quoted fields and escaped quotes.
  // Returns array of rows, each row is array of strings.
  const rows = []
  let row = []
  let field = ''
  let i = 0
  let inQuotes = false

  const pushField = () => {
    row.push(field)
    field = ''
  }
  const pushRow = () => {
    // Trim trailing \r handled by line split, but be safe.
    rows.push(row)
    row = []
  }

  while (i < text.length) {
    const c = text[i]

    if (inQuotes) {
      if (c === '"') {
        const next = text[i + 1]
        if (next === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i += 1
        continue
      }
      field += c
      i += 1
      continue
    }

    if (c === '"') {
      inQuotes = true
      i += 1
      continue
    }

    if (c === ',') {
      pushField()
      i += 1
      continue
    }

    if (c === '\n') {
      pushField()
      pushRow()
      i += 1
      continue
    }

    if (c === '\r') {
      i += 1
      continue
    }

    field += c
    i += 1
  }

  // Flush last row if any
  if (field.length > 0 || row.length > 0) {
    pushField()
    pushRow()
  }

  return rows
}

function escapeSqlString(s) {
  if (s === null || s === undefined) return 'NULL'
  return `'${String(s).replace(/'/g, "''")}'`
}

function toTimestamptz(iso) {
  // iso is like 2026-07-08T10:11:51.000Z
  return `('${String(iso).replace(/'/g, "''")}'::timestamptz)`
}

function inferBool(v) {
  const s = String(v).trim().toLowerCase()
  if (s === 'true') return 'true'
  if (s === 'false') return 'false'
  if (s === '') return 'NULL'
  return s
}

function readCsv(filePath) {
  const text = fs.readFileSync(filePath, 'utf8')
  const rows = parseCsv(text)
  if (!rows.length) return { headers: [], data: [] }
  const headers = rows[0].map((h) => h.trim())
  const data = rows.slice(1).map((r) => {
    const obj = {}
    for (let i = 0; i < headers.length; i++) obj[headers[i]] = r[i] ?? ''
    return obj
  })
  return { headers, data }
}

const __dirname = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname))
const baseDir = path.join(__dirname, 'mock-csv')

const sessionsCsv = readCsv(path.join(baseDir, 'sessions.csv')).data
const quizCsv = readCsv(path.join(baseDir, 'quiz_answers.csv')).data
const dialogueCsv = readCsv(path.join(baseDir, 'dialogue_choices.csv')).data
const testCsv = readCsv(path.join(baseDir, 'test_results.csv')).data
const mvCsv = readCsv(path.join(baseDir, 'material_views.csv')).data

// Table columns (must match schema.prisma @map() names)
const sessionsCols = [
  'id',
  'session_id',
  'user_id',
  'start_time',
  'end_time',
  'total_play_time',
  'final_coins',
  'final_wisdom',
  'completed_levels',
  'achievements',
  'time_per_level',
  'raw_json',
]

const quizCols = [
  'id',
  'session_id',
  'level_id',
  'question_index',
  'question_text',
  'selected_answer',
  'is_correct',
  'timestamp',
]

const dialogueCols = [
  'id',
  'session_id',
  'level_id',
  'dialogue_index',
  'character_name',
  'choice_text',
  'wisdom_change',
  'coin_change',
  'timestamp',
]

const testCols = ['id', 'session_id', 'test_type', 'score', 'total_questions', 'raw_answers', 'timestamp']

const mvCols = ['id', 'session_id', 'material_id', 'material_title', 'view_duration', 'timestamp']

const delSql = `
-- Clean previous mock data
delete from quiz_answers where session_id like 'session_mock_%';
delete from dialogue_choices where session_id like 'session_mock_%';
delete from test_results where session_id like 'session_mock_%';
delete from material_views where session_id like 'session_mock_%';
delete from sessions where session_id like 'session_mock_%';
`.trim()

function valueFor(col, row) {
  const v = row[col]
  if (v === undefined) return 'NULL'
  if (v === '') return 'NULL'

  // json fields
  if (col === 'completed_levels' || col === 'achievements' || col === 'time_per_level') {
    return `${escapeSqlString(v)}::jsonb`
  }
  if (col === 'raw_json') {
    return `${escapeSqlString(v)}::jsonb`
  }
  if (col === 'raw_answers') {
    return `${escapeSqlString(v)}::jsonb`
  }

  // booleans
  if (col === 'is_correct') return inferBool(v)

  // timestamps
  if (col === 'timestamp' || col === 'start_time' || col === 'end_time') {
    return toTimestamptz(v)
  }

  // numeric fields (keep as numbers)
  const numericCols = new Set([
    'level_id',
    'question_index',
    'wisdom_change',
    'coin_change',
    'score',
    'total_questions',
    'material_id',
    'view_duration',
    'total_play_time',
    'final_coins',
    'final_wisdom',
    'dialogue_index',
  ])
  if (numericCols.has(col)) return String(v)

  // ids / strings
  return escapeSqlString(v)
}

function insertMulti(table, cols, rows) {
  if (!rows.length) return ''
  const header = `insert into ${table} (${cols.join(', ')}) values`
  const values = rows
    .map((row) => `(${cols.map((c) => valueFor(c, row)).join(', ')})`)
    .join(',\n')
  return `${header}\n${values};`
}

const sql =
  delSql +
  '\n\n' +
  insertMulti('sessions', sessionsCols, sessionsCsv) +
  '\n\n' +
  insertMulti('quiz_answers', quizCols, quizCsv) +
  '\n\n' +
  insertMulti('dialogue_choices', dialogueCols, dialogueCsv) +
  '\n\n' +
  insertMulti('test_results', testCols, testCsv) +
  '\n\n' +
  insertMulti('material_views', mvCols, mvCsv) +
  '\n'

const outPath = path.join(baseDir, 'import-mock.sql')
fs.writeFileSync(outPath, sql, 'utf8')

console.log(`✅ Generated: ${outPath}`)
console.log(
  `Rows: sessions=${sessionsCsv.length}, quiz=${quizCsv.length}, dialogue=${dialogueCsv.length}, test=${testCsv.length}, mv=${mvCsv.length}`,
)


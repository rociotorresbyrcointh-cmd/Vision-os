// Debug logger que captura todo en memory y lo expone por API
let logs: string[] = []

export function debugLog(category: string, message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const logEntry = `[${timestamp}] ${category}: ${message}`

  if (data) {
    console.log(logEntry, data)
    logs.push(`${logEntry} ${JSON.stringify(data)}`)
  } else {
    console.log(logEntry)
    logs.push(logEntry)
  }
}

export function getLogs() {
  return logs
}

export function clearLogs() {
  logs = []
}

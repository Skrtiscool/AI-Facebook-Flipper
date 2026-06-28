import { schedule, ScheduledTask } from "node-cron"

type TaskFn = () => Promise<void>

let task: ScheduledTask | null = null
let isRunning = false

export function startScheduler(callback: TaskFn): void {
  if (task) {
    console.log("[Scanner] Scheduler already running")
    return
  }

  task = schedule("*/30 * * * *", async () => {
    if (isRunning) {
      console.log("[Scanner] Previous scan still in progress, skipping")
      return
    }
    isRunning = true
    try {
      await callback()
    } catch (error) {
      console.error("[Scanner] Scheduler error:", error)
    } finally {
      isRunning = false
    }
  })

  console.log("[Scanner] Scheduler started — will scan every 30 minutes")
}

export function stopScheduler(): void {
  if (task) {
    task.stop()
    task = null
    isRunning = false
    console.log("[Scanner] Scheduler stopped")
  }
}

export function isSchedulerRunning(): boolean {
  return task !== null
}

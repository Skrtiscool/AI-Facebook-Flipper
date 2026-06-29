import { NextResponse } from "next/server"
import { ensureUser } from "@/lib/ensureUser"

export async function POST() {
  try {
    await ensureUser()

    return NextResponse.json({
      message: "Scanner runs via GitHub Actions every 30 minutes",
      setup: [
        "1. Go to https://github.com/Skrtiscool/AI-Facebook-Flipper/settings/secrets/actions",
        "2. Add FB_EMAIL, FB_PASSWORD, and DATABASE_URL as repository secrets",
        "3. Go to the Actions tab and enable the 'Facebook Scanner' workflow",
        "4. Trigger a manual run to test it",
      ],
      docs: "https://github.com/Skrtiscool/AI-Facebook-Flipper#readme",
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unauthorized" },
      { status: 401 }
    )
  }
}

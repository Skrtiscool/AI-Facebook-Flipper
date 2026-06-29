import { NextResponse } from "next/server"
import { ensureUser } from "@/lib/ensureUser"

const POPULAR_KEYWORDS = [
  { keyword: "milwaukee", category: "Tools", reason: "Power tools — high resale demand" },
  { keyword: "deWalt", category: "Tools", reason: "Power tools — high resale demand" },
  { keyword: "makita", category: "Tools", reason: "Power tools — good resale" },
  { keyword: "apple", category: "Electronics", reason: "Apple products hold value" },
  { keyword: "iphone", category: "Electronics", reason: "Always in demand" },
  { keyword: "macbook", category: "Electronics", reason: "High resale value" },
  { keyword: "sony", category: "Electronics", reason: "Premium electronics brand" },
  { keyword: "nintendo", category: "Gaming", reason: "Gaming — strong resale market" },
  { keyword: "playstation", category: "Gaming", reason: "Gaming consoles in demand" },
  { keyword: "xbox", category: "Gaming", reason: "Gaming consoles in demand" },
  { keyword: "lego", category: "Toys", reason: "Lego sets appreciate over time" },
  { keyword: "dyson", category: "Home", reason: "Premium brand, good resale" },
  { keyword: "patagonia", category: "Clothing", reason: "Outdoor gear with loyal market" },
  { keyword: "supreme", category: "Clothing", reason: "Streetwear — strong resale" },
  { keyword: "yeezy", category: "Clothing", reason: "Sneakers — high demand" },
  { keyword: "jordan", category: "Clothing", reason: "Sneakers — collectible" },
  { keyword: "canon", category: "Electronics", reason: "Camera equipment holds value" },
  { keyword: "nikon", category: "Electronics", reason: "Camera equipment holds value" },
  { keyword: "bose", category: "Electronics", reason: "Audio equipment — good resale" },
  { keyword: "truck", category: "Vehicles", reason: "Trucks have strong resale" },
  { keyword: "four wheeler", category: "Vehicles", reason: "ATVs in demand" },
  { keyword: "dirt bike", category: "Vehicles", reason: "Dirt bikes sell fast" },
  { keyword: "tractor", category: "Vehicles", reason: "Farm equipment — good margins" },
  { keyword: "zero turn", category: "Vehicles", reason: "Lawn equipment in demand" },
  { keyword: "snowmobile", category: "Vehicles", reason: "Seasonal — premium pricing" },
  { keyword: "generator", category: "Home", reason: "Always in demand" },
  { keyword: "pressure washer", category: "Home", reason: "Good flips" },
  { keyword: "table saw", category: "Tools", reason: "Shop tools sell well" },
  { keyword: "planer", category: "Tools", reason: "Woodworking tools in demand" },
  { keyword: "jointer", category: "Tools", reason: "Woodworking tools" },
  { keyword: "drill", category: "Tools", reason: "Common flip item" },
  { keyword: "impact wrench", category: "Tools", reason: "Mechanic tools sell" },
]

export async function GET() {
  try {
    await ensureUser()
    return NextResponse.json(POPULAR_KEYWORDS)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

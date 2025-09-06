import { NextResponse } from "next/server"
import { models } from "@/utils/text-respond"

export async function GET() {
  return NextResponse.json(models)
}

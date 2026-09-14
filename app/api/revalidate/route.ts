import { revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
    );

    if (!isValidSignature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    if (!body?._type) {
      return NextResponse.json({ message: "Missing _type in payload" }, { status: 400 });
    }

    revalidateTag(body._type, { expire: 0 });

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Error revalidating" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { ref, update, get, child } from "firebase/database";

export async function POST(req) {
  try {
    const { formData } = await req.json();
    console.log(formData);

    const campaignId = formData.campaignId;
    const updates = {};
    updates[`/campaigns/${campaignId}/enabled`] = false;

    const snapshot = await get(child(ref(db), `inscriptions/${campaignId}`));
    if (!snapshot.exists()) {
      console.log("No data available");
      return NextResponse.error("No data available");
    }
    const inscriptions = snapshot.val();
    Object.keys(inscriptions).forEach((timeslot) => {
      if ("appointments" in inscriptions[timeslot]) {
        Object.keys(inscriptions[timeslot]["appointments"]).forEach(
          (appointment) => {
            const path = `/appointments/${inscriptions[timeslot]["appointments"][appointment]["id"]}/${appointment}`;
            updates[`${path}/enabled`] = false;
          }
        );
      }
    });

    await update(ref(db), updates);
    return NextResponse.json({ message: "Form data saved successfully!" });
  } catch (error) {
    console.error(error);
    return NextResponse.error(error);
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { ref, update, get, child } from "firebase/database";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export async function updateCampaign(formData) {
  try {
    let user = null;
    // Use onAuthStateChanged to get the current user
    await new Promise((resolve) => {
      onAuthStateChanged(auth, (currentUser) => {
        user = currentUser;
        resolve(); // Resolve the promise when the user is available
      });
    });

    if (!user) {
      return NextResponse.error("User not authenticated", { status: 401 });
    }

    const campaignId = formData.campaignId;
    const updates = {};
    updates[`/campaigns/${campaignId}/title`] = formData.title;
    updates[`/campaigns/${campaignId}/date`] = formData.date;
    updates[`/campaigns/${campaignId}/description`] = formData.description;
    updates[`/campaigns/${campaignId}/phone`] = formData.phone;
    updates[`/campaigns/${campaignId}/place`] = formData.place;
    updates[`/campaigns/${campaignId}/pricesData`] = formData.pricesData;
    updates[`/campaigns/${campaignId}/priceSpecial`] = formData.priceSpecial;
    updates[`/campaigns/${campaignId}/requirements`] = formData.requirements;

    if (formData.photos.length > 0) {
      updates[`/campaigns/${campaignId}/photos`] = formData.photos;
    }

    const snapshot = await get(child(ref(db), `inscriptions/${campaignId}`));
    if (!snapshot.exists()) {
      return NextResponse.error("No data available");
    }
    const inscriptions = snapshot.val();
    Object.keys(inscriptions).forEach((timeslot) => {
      if ("appointments" in inscriptions[timeslot]) {
        Object.keys(inscriptions[timeslot]["appointments"]).forEach(
          (appointment) => {
            const path = `/appointments/${inscriptions[timeslot]["appointments"][appointment]["id"]}/${appointment}`;
            updates[`${path}/campaign`] = formData.title;
            updates[`${path}/date`] = formData.date;
            updates[`${path}/place`] = formData.place;
          }
        );
      }
    });

    await update(ref(db), updates);
    return NextResponse.json({ message: "Form data saved successfully!" });
  } catch (error) {
    return NextResponse.error(error);
  }
}

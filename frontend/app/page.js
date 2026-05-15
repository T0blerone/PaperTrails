import { getSessionUser } from "@/lib/auth";
import { getDeviceStatus, listPeopleForUser, listRecentNotes } from "@/lib/store";
import { NOTE_MAX_LENGTH } from "@/lib/config";
import PaperTrailsApp from "@/components/PaperTrailsApp";

export default async function Home() {
  const user = await getSessionUser();

  return (
    <PaperTrailsApp
      initialUser={user}
      initialPeople={user ? listPeopleForUser(user.id) : []}
      initialNotes={user ? listRecentNotes(user.id) : []}
      initialDevices={getDeviceStatus()}
      maxLength={NOTE_MAX_LENGTH}
    />
  );
}

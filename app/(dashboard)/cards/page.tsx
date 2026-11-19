import { redirect } from "next/navigation";

export default function CardsPage() {
  redirect("/dashboard?drawer=cards");
}

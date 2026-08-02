import { RaffleDetailPage } from "./_components/raffle-detail-page";
export default function RaffleDetail({ params }: { params: { id: string } }) {
  return <RaffleDetailPage id={params?.id ?? ""} />;
}

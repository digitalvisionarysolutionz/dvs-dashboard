import ComingSoonPage from "../../../components/dashboard/ComingSoonPage.jsx";

export default function PaymentsPage() {
  return (
    <ComingSoonPage
      eyebrow="Payments"
      title="Payments & Invoices"
      description="Track paid, unpaid, recurring, and overdue balances with clean billing visibility."
      items={[
        "Invoice list",
        "Payment status",
        "Recurring revenue",
        "Outstanding balances",
        "Stripe integration later",
        "Client payment history",
      ]}
    />
  );
}
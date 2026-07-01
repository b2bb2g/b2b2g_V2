import type { Metadata } from "next";
import { SupplierProductRegistrationForm } from "@/components/dashboard/supplier-product-registration-form";

export const metadata: Metadata = {
  title: "New product registration",
};

export default function DashboardNewProductPage() {
  return <SupplierProductRegistrationForm />;
}

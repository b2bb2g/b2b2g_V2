import type { Metadata } from "next";
import { SignupStartCard } from "@/components/public/signup-start-card";
import { t } from "@/lib/i18n/translation";
import { buildPublicMetadata } from "@/lib/seo/metadata";

type SignupStartPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = buildPublicMetadata({
  canonicalPath: "/signup/buyer",
  description: t("signupStart.buyer.metaDescription"),
  title: t("signupStart.buyer.title"),
});

function hasInvitationToken(searchParams: Record<string, string | string[] | undefined>) {
  const value = searchParams.invitation_token;
  const token = Array.isArray(value) ? value[0] : value;

  return Boolean(token?.trim());
}

export default async function BuyerSignupStartPage({
  searchParams,
}: Readonly<SignupStartPageProps>) {
  const resolvedSearchParams = searchParams ? await searchParams : {};

  return (
    <SignupStartCard
      hasInvitationToken={hasInvitationToken(resolvedSearchParams)}
      role="buyer"
    />
  );
}

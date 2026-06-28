import type { Metadata } from "next";
import { DashboardMessagesPage as DashboardMessagesView } from "@/components/dashboard/dashboard-pages";
import { t } from "@/lib/i18n/translation";
import { getDashboardMessagesData } from "@/lib/queries/dashboard";

type MessagesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: t("dashboard.messages.title"),
};

function getParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function getNoticeMessage(resultCode: string | string[] | undefined): string | null {
  const code = getParam(resultCode);

  if (code === "sent") {
    return t("dashboard.messages.result.sent");
  }

  return null;
}

function getErrorMessage(errorCode: string | string[] | undefined): string | null {
  const code = getParam(errorCode);

  if (!code) {
    return null;
  }

  if (
    code === "blocked" ||
    code === "conversation_not_found" ||
    code === "not_member" ||
    code === "send_failed"
  ) {
    return t(`dashboard.messages.error.${code}`);
  }

  return t("dashboard.messages.error.send_failed");
}

export default async function DashboardMessagesPage({ searchParams }: MessagesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedConversationId = getParam(resolvedSearchParams.conversation);
  const data = await getDashboardMessagesData(selectedConversationId);

  return (
    <DashboardMessagesView
      data={data}
      errorMessage={getErrorMessage(resolvedSearchParams.error)}
      noticeMessage={getNoticeMessage(resolvedSearchParams.result)}
    />
  );
}

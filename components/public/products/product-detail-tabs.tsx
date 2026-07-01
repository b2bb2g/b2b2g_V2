"use client";

import { useState } from "react";

export type ProductDetailTabSpec = {
  label: string;
  value: string;
};

export type ProductDetailTabSection = {
  bullets?: string[];
  description?: string;
  specs?: ProductDetailTabSpec[];
  title: string;
};

export type ProductDetailTabItem = {
  description: string;
  eyebrow: string;
  id: string;
  sections: ProductDetailTabSection[];
  title: string;
};

type ProductDetailTabsProps = {
  tabs: ProductDetailTabItem[];
};

export function ProductDetailTabs({ tabs }: Readonly<ProductDetailTabsProps>) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "");
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  if (!activeTab) {
    return null;
  }

  return (
    <section className="rounded-[30px] border border-[#dbe6f2] bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.055)] sm:p-6">
      <div className="grid gap-2 rounded-[22px] bg-[#f5f8fc] p-1 sm:grid-cols-3">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab.id;

          return (
            <button
              className={`min-h-12 rounded-[18px] px-4 text-left text-[13px] font-black transition ${
                isActive
                  ? "bg-white text-[#0066cc] shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
                  : "text-[#667085] hover:bg-white/70 hover:text-[#101828]"
              }`}
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              type="button"
            >
              {tab.title}
            </button>
          );
        })}
      </div>

      <div className="mt-7">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0066cc]">{activeTab.eyebrow}</p>
        <h2 className="mt-2 text-[30px] font-semibold leading-[1.05] tracking-[-0.045em] text-[#101828] sm:text-[42px]">
          {activeTab.title}
        </h2>
        <p className="mt-3 max-w-3xl text-[14px] leading-6 text-[#667085]">{activeTab.description}</p>
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        {activeTab.sections.map((section) => (
          <article className="rounded-[24px] border border-[#dbe6f2] bg-[#fbfdff] p-5" key={section.title}>
            <h3 className="text-[18px] font-semibold tracking-[-0.025em] text-[#101828]">{section.title}</h3>
            {section.description ? (
              <p className="mt-3 text-[13px] leading-6 text-[#667085]">{section.description}</p>
            ) : null}
            {section.specs ? (
              <div className="mt-4 grid gap-2">
                {section.specs.map((spec) => (
                  <div className="rounded-2xl bg-white px-4 py-3" key={spec.label}>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#667085]">{spec.label}</p>
                    <p className="mt-1 text-[13px] font-semibold text-[#101828]">{spec.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
            {section.bullets ? (
              <ul className="mt-4 space-y-3">
                {section.bullets.map((bullet) => (
                  <li className="flex gap-3 text-[13px] leading-6 text-[#667085]" key={bullet}>
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0066cc]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

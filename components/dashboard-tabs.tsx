"use client";

import { type KeyboardEvent, type ReactNode, useState } from "react";

type DashboardTab = {
  content: ReactNode;
  id: string;
  label: string;
};

type DashboardTabsProps = {
  tabs: DashboardTab[];
};

export function DashboardTabs({ tabs }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");
  const selectedTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const selectedIndex = tabs.findIndex((tab) => tab.id === selectedTab.id);

  function focusTab(index: number) {
    const nextTab = tabs[index];

    if (!nextTab) {
      return;
    }

    setActiveTab(nextTab.id);
    document.getElementById(`${nextTab.id}-tab`)?.focus();
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusTab((selectedIndex + 1) % tabs.length);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusTab((selectedIndex - 1 + tabs.length) % tabs.length);
    }
  }

  return (
    <section className="grid gap-6">
      <div
        aria-label="Dashboard sections"
        className="grid rounded-xl border border-white/70 bg-white/[0.62] p-1 shadow-[0_14px_40px_rgba(120,95,130,0.12)] backdrop-blur sm:grid-cols-3"
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === selectedTab.id;

          return (
            <button
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              className={[
                "rounded-lg px-4 py-3 text-sm font-semibold transition",
                isActive
                  ? "bg-ink text-white shadow-[0_8px_24px_rgba(63,57,71,0.18)]"
                  : "text-mist hover:bg-white/70 hover:text-ink"
              ].join(" ")}
              id={`${tab.id}-tab`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={handleTabKeyDown}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        aria-labelledby={`${selectedTab.id}-tab`}
        className="grid gap-6"
        id={`${selectedTab.id}-panel`}
        role="tabpanel"
      >
        {selectedTab.content}
      </div>
    </section>
  );
}

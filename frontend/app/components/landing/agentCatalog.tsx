"use client";
import { useState } from "react";

type CatalogKey = "sales ops" | "orders" | "invoice &PO" | "printavo" | "Qualia" | "Custom";

interface CatalogEntry {
  heading: string;
  advantagePrefix: string;
  advantageHighlight: string;
  trigger: string;
  actions: string[];
  timeBefore: string;
  timeAfter: string;
}

const completeCatalog: Record<CatalogKey, CatalogEntry> = {
  "sales ops": {
    heading: "Sales Handoff",
    advantagePrefix: "From closed deal to onboarding in ",
    advantageHighlight: "30 seconds.",
    trigger: "Deal closed in Salesforce",
    actions: [
      "Create Jira onboarding ticket",
      "Ping #cs-onboarding in Slack",
      "Generate QuickBooks invoice",
    ],
    timeBefore: "30 min",
    timeAfter: "30 sec",
  },
  orders: {
    heading: "Order Routing",
    advantagePrefix: "From Shopify order to ledger in ",
    advantageHighlight: "5 seconds.",
    trigger: "Order placed in Shopify",
    actions: [
      "Push to QuickBooks ledger",
      "Update inventory in Notion",
      "Alert warehouse in Slack",
    ],
    timeBefore: "5 min",
    timeAfter: "5 sec",
  },
  "invoice &PO": {
    heading: "Invoice & PO Tracking",
    advantagePrefix: "From Gmail invoice to QuickBooks in ",
    advantageHighlight: "10 seconds.",
    trigger: "Invoice received in Gmail",
    actions: [
      "Parse invoice with AI",
      "Match to open PO in NetSuite",
      "Flag discrepancies in Slack",
    ],
    timeBefore: "10 min",
    timeAfter: "10 sec",
  },
  printavo: {
    heading: "Print Shop Pipeline",
    advantagePrefix: "From order to customer proof in ",
    advantageHighlight: "2 minutes.",
    trigger: "Order received in Printavo",
    actions: [
      "Generate art proof from template",
      "Email proof to customer",
      "Log status in Airtable",
    ],
    timeBefore: "2 hrs",
    timeAfter: "2 min",
  },
  Qualia: {
    heading: "Title Order Workflow",
    advantagePrefix: "From title order to closing brief in ",
    advantageHighlight: "60 seconds.",
    trigger: "Title order opened in Qualia",
    actions: [
      "Pull property data from county",
      "Draft closing brief in Docs",
      "Notify closer in Slack",
    ],
    timeBefore: "60 min",
    timeAfter: "60 sec",
  },
  Custom: {
    heading: "Day-1 Onboarding",
    advantagePrefix: "From hire date to fully onboarded in ",
    advantageHighlight: "1 day.",
    trigger: "New hire start date set",
    actions: [
      "Provision accounts in Okta",
      "Send welcome kit via email",
      "Schedule 1:1s in Google Cal",
    ],
    timeBefore: "2 weeks",
    timeAfter: "1 day",
  },
};

const catalogTabs: { key: CatalogKey; label: string; icon: string }[] = [
  { key: "sales ops", label: "Sales Ops", icon: "↗" },
  { key: "orders", label: "Orders", icon: "◎" },
  { key: "invoice &PO", label: "Invoice & PO", icon: "◻" },
  { key: "printavo", label: "Printavo", icon: "✦" },
  { key: "Qualia", label: "Qualia", icon: "◈" },
  { key: "Custom", label: "Custom", icon: "⊹" },
];

const actionIcons: Record<string, { bg: string; symbol: string }> = {
  "Create Jira onboarding ticket": { bg: "bg-blue-600", symbol: "J" },
  "Ping #cs-onboarding in Slack": { bg: "bg-purple-600", symbol: "S" },
  "Generate QuickBooks invoice": { bg: "bg-green-600", symbol: "Q" },
  "Push to QuickBooks ledger": { bg: "bg-green-600", symbol: "Q" },
  "Update inventory in Notion": { bg: "bg-gray-800", symbol: "N" },
  "Alert warehouse in Slack": { bg: "bg-purple-600", symbol: "S" },
  "Parse invoice with AI": { bg: "bg-indigo-500", symbol: "AI" },
  "Match to open PO in NetSuite": { bg: "bg-orange-500", symbol: "NS" },
  "Flag discrepancies in Slack": { bg: "bg-purple-600", symbol: "S" },
  "Generate art proof from template": { bg: "bg-pink-500", symbol: "AP" },
  "Email proof to customer": { bg: "bg-blue-500", symbol: "✉" },
  "Log status in Airtable": { bg: "bg-yellow-500", symbol: "A" },
  "Pull property data from county": { bg: "bg-teal-600", symbol: "P" },
  "Draft closing brief in Docs": { bg: "bg-blue-500", symbol: "G" },
  "Notify closer in Slack": { bg: "bg-purple-600", symbol: "S" },
  "Provision accounts in Okta": { bg: "bg-blue-700", symbol: "O" },
  "Send welcome kit via email": { bg: "bg-red-500", symbol: "✉" },
  "Schedule 1:1s in Google Cal": { bg: "bg-green-500", symbol: "G" },
};

export default function AgentCatalog() {
  const [agent, setAgent] = useState<CatalogKey>("sales ops");
  const current = completeCatalog[agent];

  return (
    <section className="bg-[#f5f0e6] text-black py-24 px-6 flex justify-center">
      <div className="w-full max-w-2xl flex flex-col items-center text-center gap-8">

        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs tracking-[0.2em] text-gray-500 uppercase font-medium">
            For Your Team
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-gray-900 leading-tight">
            Built for the teams that{" "}
            <em className="text-[#5c8a5c] not-italic font-serif italic">ship.</em>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Pick yours. Each agent is in production today.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {catalogTabs.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setAgent(key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm border transition-all ${
                agent === key
                  ? "border-gray-400 bg-white text-gray-900 shadow-sm font-medium"
                  : "border-gray-300 bg-transparent text-gray-500 hover:border-gray-400 hover:text-gray-700"
              }`}
            >
              <span className="text-xs opacity-70">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Advantage Heading */}
        <h3 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 leading-snug">
          {current.advantagePrefix}
          <em className="text-[#5c8a5c] italic">{current.advantageHighlight}</em>
        </h3>

        {/* Card */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left">
          {/* Card Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gray-900 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">N</span>
              </div>
              <span className="font-semibold text-gray-900 text-sm">{current.heading}</span>
            </div>
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
              <span className="text-xs font-medium text-gray-600 tracking-wide">LIVE</span>
            </div>
          </div>

          {/* Trigger */}
          <p className="text-[10px] tracking-widest text-gray-400 uppercase font-semibold mb-2">
            Trigger
          </p>
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5 mb-5">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">SF</span>
            </div>
            <span className="text-sm text-gray-700">{current.trigger}</span>
          </div>

          {/* Actions */}
          <p className="text-[10px] tracking-widest text-gray-400 uppercase font-semibold mb-3">
            Then Nobelium
          </p>
          <div className="flex flex-col divide-y divide-gray-100">
            {current.actions.map((action) => {
              const icon = actionIcons[action] ?? { bg: "bg-gray-500", symbol: "•" };
              return (
                <div key={action} className="flex items-center gap-3 py-2.5">
                  <div className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-500 text-[8px] font-bold">✓</span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${icon.bg}`}
                  >
                    <span className="text-white text-[8px] font-bold">{icon.symbol}</span>
                  </div>
                  <span className="text-sm text-gray-700">{action}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comparison */}
        <div className="w-full grid grid-cols-2 gap-3">
          <div className="bg-[#ede8dc] rounded-xl px-6 py-5 text-center">
            <p className="text-[10px] tracking-widest text-gray-400 uppercase font-semibold mb-1">
              Earlier
            </p>
            <p className="text-2xl font-semibold text-gray-400 line-through decoration-gray-400">
              {current.timeBefore}
            </p>
          </div>
          <div className="bg-[#d8d3c8] rounded-xl px-6 py-5 text-center">
            <p className="text-[10px] tracking-widest text-gray-500 uppercase font-semibold mb-1">
              With Nobelium
            </p>
            <p className="text-2xl font-semibold text-gray-700">{current.timeAfter}</p>
          </div>
        </div>

        {/* CTA */}
        <button className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-gray-800 transition-colors">
          Book a free demo
          <span>→</span>
        </button>
      </div>
    </section>
  );
}

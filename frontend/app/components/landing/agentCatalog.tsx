"use client";
import { useState } from "react";

type CatalogKey = "printavo" | "shopworks" | "qualia" | "netsuite";

interface CatalogEntry {
  heading: string;
  cardTitle: string;
  advantagePrefix: string;
  advantageHighlight: string;
  trigger: { icon: string; iconBg: string; text: string };
  actions: { icon: string; iconBg: string; text: string }[];
  timeBefore: string;
  timeBeforeNote: string;
  timeAfter: string;
  timeAfterNote: string;
}

const completeCatalog: Record<CatalogKey, CatalogEntry> = {
  printavo: {
    heading: "Email PO to Printavo job in",
    cardTitle: "Printavo PO Entry",
    advantagePrefix: "Email PO to Printavo job in ",
    advantageHighlight: "2 minutes.",
    trigger: { icon: "M", iconBg: "bg-red-500", text: "PO email arrives in Gmail" },
    actions: [
      { icon: "✉", iconBg: "bg-red-500", text: "Extract line items, specs, and customer info" },
      { icon: "P", iconBg: "bg-red-600", text: "Create job in Printavo with all details" },
      { icon: "M", iconBg: "bg-red-500", text: "Email order confirmation to customer" },
    ],
    timeBefore: "25 min",
    timeBeforeNote: "",
    timeAfter: "2 min",
    timeAfterNote: "Run team touches nothing",
  },
  shopworks: {
    heading: "Shopify order to fulfillment in",
    cardTitle: "Shopworks Sync",
    advantagePrefix: "Shopify order to fulfillment in ",
    advantageHighlight: "5 seconds.",
    trigger: { icon: "S", iconBg: "bg-green-600", text: "Order placed in Shopify" },
    actions: [
      { icon: "Q", iconBg: "bg-green-600", text: "Push to QuickBooks ledger" },
      { icon: "N", iconBg: "bg-gray-800", text: "Update inventory in Notion" },
      { icon: "S", iconBg: "bg-purple-600", text: "Alert warehouse in Slack" },
    ],
    timeBefore: "5 min",
    timeBeforeNote: "",
    timeAfter: "5 sec",
    timeAfterNote: "Fully automated",
  },
  qualia: {
    heading: "Title order to closing brief in",
    cardTitle: "Qualia Title Flow",
    advantagePrefix: "Title order to closing brief in ",
    advantageHighlight: "60 seconds.",
    trigger: { icon: "Q", iconBg: "bg-teal-600", text: "Title order opened in Qualia" },
    actions: [
      { icon: "P", iconBg: "bg-teal-600", text: "Pull property data from county" },
      { icon: "G", iconBg: "bg-blue-500", text: "Draft closing brief in Docs" },
      { icon: "S", iconBg: "bg-purple-600", text: "Notify closer in Slack" },
    ],
    timeBefore: "60 min",
    timeBeforeNote: "",
    timeAfter: "60 sec",
    timeAfterNote: "Zero manual steps",
  },
  netsuite: {
    heading: "Invoice matched to PO in",
    cardTitle: "NetSuite Matching",
    advantagePrefix: "Invoice matched to PO in ",
    advantageHighlight: "10 seconds.",
    trigger: { icon: "M", iconBg: "bg-red-500", text: "Invoice received in Gmail" },
    actions: [
      { icon: "AI", iconBg: "bg-indigo-500", text: "Parse invoice with AI" },
      { icon: "NS", iconBg: "bg-orange-500", text: "Match to open PO in NetSuite" },
      { icon: "S", iconBg: "bg-purple-600", text: "Flag discrepancies in Slack" },
    ],
    timeBefore: "10 min",
    timeBeforeNote: "",
    timeAfter: "10 sec",
    timeAfterNote: "Hands-free reconciliation",
  },
};

const catalogTabs: { key: CatalogKey; label: string; icon: string }[] = [
  { key: "printavo", label: "Printevo", icon: "⊞" },
  { key: "shopworks", label: "Shopworks", icon: "◎" },
  { key: "qualia", label: "Qualia", icon: "◈" },
  { key: "netsuite", label: "NetSuite", icon: "◇" },
];

export default function AgentCatalog() {
  const [agent, setAgent] = useState<CatalogKey>("printavo");
  const current = completeCatalog[agent];

  return (
    <section className="bg-[#f5f0e6] text-black py-24 px-6 flex justify-center">
      <div className="w-full max-w-2xl flex flex-col items-center text-center gap-8">

        <div className="flex flex-col items-center gap-3">
          <span className="text-[11px] tracking-[0.2em] text-gray-400 uppercase font-semibold">
            Built for your stack
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-gray-900 leading-tight">
            Built for the teams that{" "}
            <em className="text-[#5c8a5c] italic">ship.</em>
          </h2>
          <p className="text-sm text-gray-500 mt-1 max-w-md">
            Real agents. Running live workflows right now. Pick the one closest to yours.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {catalogTabs.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setAgent(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm border transition-all ${
                agent === key
                  ? "border-gray-400 bg-white text-gray-900 shadow-sm font-medium"
                  : "border-gray-200 bg-transparent text-gray-500 hover:border-gray-400 hover:text-gray-700"
              }`}
            >
              <span className="text-xs opacity-60">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        <h3 className="text-2xl md:text-3xl font-serif text-gray-900 leading-snug">
          {current.advantagePrefix}
          <em className="text-[#5c8a5c] italic">{current.advantageHighlight}</em>
        </h3>

        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">N</span>
              </div>
              <span className="font-semibold text-gray-900 text-sm">{current.cardTitle}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              <span className="text-xs font-semibold text-green-600 tracking-wide">LIVE</span>
            </div>
          </div>

          <div className="px-6 py-5 text-left">
            <p className="text-[10px] tracking-[0.15em] text-gray-400 uppercase font-semibold mb-2.5">
              Trigger
            </p>
            <div className="inline-flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 mb-6">
              <div className={`w-5 h-5 ${current.trigger.iconBg} rounded flex items-center justify-center`}>
                <span className="text-white text-[9px] font-bold">{current.trigger.icon}</span>
              </div>
              <span className="text-sm text-gray-700">{current.trigger.text}</span>
            </div>

            <p className="text-[10px] tracking-[0.15em] text-gray-400 uppercase font-semibold mb-3">
              Then Nobelium
            </p>
            <div className="flex flex-col gap-0.5">
              {current.actions.map((action, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5">
                  <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${action.iconBg}`}>
                    <span className="text-white text-[8px] font-bold">{action.icon}</span>
                  </div>
                  <span className="text-sm text-gray-700">{action.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-3">
          <div className="bg-gray-100 rounded-xl px-6 py-5 text-center">
            <p className="text-[10px] tracking-[0.15em] text-gray-400 uppercase font-semibold mb-2">
              Without Nobelium
            </p>
            <p className="text-2xl font-semibold text-gray-400 line-through decoration-gray-300">
              {current.timeBefore}
            </p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl px-6 py-5 text-center">
            <p className="text-[10px] tracking-[0.15em] text-green-600 uppercase font-semibold mb-2">
              With Nobelium
            </p>
            <p className="text-2xl font-semibold text-green-700">{current.timeAfter}</p>
            {current.timeAfterNote && (
              <p className="text-xs text-green-500 mt-1">{current.timeAfterNote}</p>
            )}
          </div>
        </div>

        <button className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-gray-800 transition-colors">
          See it with your workflow
          <span>→</span>
        </button>
      </div>
    </section>
  );
}

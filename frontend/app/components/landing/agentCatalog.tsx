"use client";
import { useState } from "react";

export default function AgentCatalog() {
  const catalog = [
    "sales ops",
    "orders",
    "invoice &PO",
    "printavo",
    "Qualia",
    "Custom",
  ];

  const completeCatalog = {
    "sales ops": {
      heading: " Sales Handoff",
      Advantage: "From closed deal to onboarding in 30 seconds.",
      trigger: "",
      Action: [
        "Create Jira onboarding ticket",
        "Ping #cs-onboarding in Slack",
        "Generate QuickBooks invoice",
      ],
    },
    orders: {
      heading: " Order Routing",
      Advantage: "From Shopify order to ledger in 5 seconds.",
      trigger: "Deal closed in Salesforce",
      Action: [
        "Push to QuickBooks ledger",
        "Update inventory in Notion",
        "Alert warehouse in Slack",
      ],
    },
    "invoice &PO": {
      heading: " Invoice & PO Tracking",
      Advantage: "From Gmail invoice to QuickBooks in 10 seconds.",

      trigger: "Order placed in Shopify",
      Action: [
        "Push to QuickBooks ledger",
        "Update inventory in Notion",
        "Alert warehouse in Slack",
      ],
    },
    printavo: {
      heading: " Print Shop Pipeline",
      Advantage: "From order to customer proof in 2 minutes",
      trigger: "order received in printavo",
      Action: [
        "Push to QuickBooks ledger",
        "Update inventory in Notion",
        "Alert warehouse in Slack",
      ],
    },
    Qualia: {
      heading: " Title Order Workflow",
      Advantage: "From title order to closing brief in 60 seconds.",
      trigger: "Title order opened in Qualia",
      Action: [
        "Push to QuickBooks ledger",
        "Update inventory in Notion",
        "Alert warehouse in Slack",
      ],
    },
    Custom: {
      heading: " Day-1 Onboarding",
      Advantage: "From hire date to fully onboarded in 1 day.",
      trigger: "New hire start date set",
      Action: [
        "Push to QuickBooks ledger",
        "Update inventory in Notion",
        "Alert warehouse in Slack",
      ],
    },
  };
  
  const [agent, SetAgent] = useState("sales ops");
  return (
    <div className="bg-[#fcf9f3] text-black flex justify-center">
      <div className="max-w-250 w-full space-y-10">
        <div className="flex flex-col">
          <span>FOR YOUR TEAM</span>
          <h1>Built for the teams that ship.</h1>
          <span>Pick yours. Each agent is in production today.</span>
        </div>
        <div className="flex flex-row space-x-2">
          {catalog.map((name) => {
            return (
              <button
                key={name}
                onClick={() => {
                  SetAgent(name);
                }}
              >
                {name}
              </button>
            );
          })}
        </div>
        <div className="max-w-150 flex flex-col">
          <div>{completeCatalog[agent].Advantage}</div>
          <div className="border-1 border-gray-700 bg-white flex flex-col">
            <div className="flex justify-between">
              <h1>{completeCatalog[agent].heading}</h1>
              <div className="border-1 p-1 rounded-xl bg-gray-400">Live</div>
            </div>
            <h1>TRIGGER</h1>
            <div>{completeCatalog[agent].trigger}</div>
            <h1>THEN NOBELIUM</h1>
            <div>
                {completeCatalog[agent].Action.map((value)=>{
                    return(<div className="border-1 border-gray-500 ">
                        {value}
                    </div>)
                })}
            </div>
          </div>
          <div className=" space-x-8 flex justify-center justi w-full">
                <div className="border-1 p-3 ">
                    Earlier 2 Weeks
                </div>
                <div className="border-1 p-3  bg-amber-950 opacity-70">
                    With Nobelium in 1 day
                </div>
          </div>
          <button className="border-1 p-2 border-gray-400 bg-gray-500 max-w-50 mx-auto">
            book a demo
          </button>
        </div>
      </div>
    </div>
  );
}

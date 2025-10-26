"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import AuthForm from "./components/AuthForm";
import { supabase } from "./lib/supabaseClient";
import { fetchUserAnalyses, createUserAnalysis, fetchAnalysisById } from "./lib/adAnalysis";

const AgentGraph = dynamic(() => import("./components/AgentGraph"), {
  ssr: false,
});
const Sidebar = dynamic(() => import("./components/Sidebar"), { ssr: false });
const CreateAdModal = dynamic(() => import("./components/CreateAdModal"), {
  ssr: false,
});
const AnalysisPanel = dynamic(() => import("./components/AnalysisPanel"), {
  ssr: false,
});

export default function Home() {
  // Share selected community between sidebar and graph
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [analysisOpen, setAnalysisOpen] = useState<boolean>(false);
  const NUM_COMMUNITIES = 20;
  const MEMBERS_PER_COMMUNITY = 50;
  type Attn = "full" | "neutral" | "ignore";
  const [analysisMap, setAnalysisMap] = useState<Record<number, { attention: Attn; insight: string }> | null>(null);
  const [panelData, setPanelData] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<{ id: string; title: string; date: string }[]>([]);
  const lastInputRef = React.useRef<{ brand: string; desc: string; fileName: string | null; file: File | null } | null>(null);

  // Open analysis automatically when the modal dispatches an event (until backend is wired)
  useEffect(() => {
    const handler = () => {
      // Synthesize analysis for demo: choose 100 relevant agents among 1000
      const total = NUM_COMMUNITIES * MEMBERS_PER_COMMUNITY;
      const ids = Array.from({ length: total }, (_, i) => i);
      for (let i = ids.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
      const selected = ids.slice(0, 100);
      const insightsPool = [
        "Clear and compelling value proposition.",
        "Feels generic; needs specificity.",
        "Visuals are engaging, copy could be tighter.",
        "Strong hook; would consider learning more.",
        "Not relevant to my current goals.",
      ];
      const map: Record<number, { attention: Attn; insight: string }> = {};
      selected.forEach((id) => {
        const r = Math.random();
        const attention: Attn = r < 0.25 ? "full" : r < 0.7 ? "neutral" : "ignore";
        map[id] = {
          attention,
          insight: insightsPool[Math.floor(Math.random() * insightsPool.length)],
        };
      });
      setAnalysisMap(map);

      const full = Object.values(map).filter((x) => x.attention === "full").length;
      const neutral = Object.values(map).filter((x) => x.attention === "neutral").length;
      const ignore = Object.values(map).filter((x) => x.attention === "ignore").length;
      const totalSel = selected.length || 1;
      const pct = (n: number) => Math.round((n / totalSel) * 100);
      const impact = Math.round(pct(full) * 0.8 + pct(neutral) * 0.3);
      setPanelData({
        title: "Results",
        impactScore: Math.max(0, Math.min(100, impact)),
        attention: { full: pct(full), partial: pct(neutral), ignore: pct(ignore) },
        insights: [
          "Overall reaction synthesized from top 100 relevant agents.",
          "Use this to iterate on clarity, relevance, and hook strength.",
        ],
        demographicInsights: [
          { percent: 56, text: "noted clarity or substance issues in the message." },
          { percent: 32, text: "mentioned time constraints; content was skimmed." },
          { percent: 18, text: "requested more relevance to current needs." },
        ],
      });
      setAnalysisOpen(true);

      // Persist the analysis for the current user
      const save = async () => {
        try {
          const input = lastInputRef.current;

          // Optional: call remote extraction and brandmeta endpoints if a file is provided
          let feature_output: any = null;
          let brandmeta_output: any = null;
          if (input?.file) {
            try {
              const form = new FormData();
              form.append("file", input.file);
              const extractRes = await fetch("/api/extract", { method: "POST", body: form });
              if (extractRes.ok) feature_output = await extractRes.json();
            } catch (_) {}

            try {
              // Build a payload that satisfies BrandMetaRequest: either features or raw fields
              const bmPayload = feature_output
                ? {
                    features: feature_output,
                    moondream_summary: input?.desc || undefined,
                  }
                : {
                    ocr_text: input?.desc || undefined,
                    detected_brand_names: input?.brand ? [input.brand] : undefined,
                  };
              const bmParams = new URLSearchParams({ provider: "openai", temperature: "0.2", debug: "true" });
              const bmRes = await fetch(`/api/brandmeta?${bmParams.toString()}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bmPayload),
              });
              if (bmRes.ok) brandmeta_output = await bmRes.json();
            } catch (_) {}
          }

          const output = {
            panelData: {
              title: "Results",
              impactScore: Math.max(0, Math.min(100, impact)),
              attention: { full: pct(full), partial: pct(neutral), ignore: pct(ignore) },
              insights: [
                "Overall reaction synthesized from top 100 relevant agents.",
                "Use this to iterate on clarity, relevance, and hook strength.",
              ],
              demographicInsights: [
                { percent: 56, text: "noted clarity or substance issues in the message." },
                { percent: 32, text: "mentioned time constraints; content was skimmed." },
                { percent: 18, text: "requested more relevance to current needs." },
              ],
            },
          };
          const title = input?.brand || input?.fileName || (input?.desc ? input.desc.slice(0, 30) : null) || "Untitled";
          await createUserAnalysis({
            title,
            input: { brand: input?.brand ?? "", desc: input?.desc ?? "", fileName: input?.fileName ?? null },
            output,
            feature_output,
            brandmeta_output,
            agent_results: {
              selected: selected,
              byId: map,
            },
          });
          await reloadAnalyses();
        } catch (e) {
          // ignore persist errors in demo
        }
      };
      save();
    };
    window.addEventListener("advisor:openAnalysis", handler as any);
    return () => window.removeEventListener("advisor:openAnalysis", handler as any);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUserEmail(data.session?.user?.email ?? null);
      if (data.session?.user) await reloadAnalyses();
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
      if (session?.user) reloadAnalyses();
      else setAnalyses([]);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const reloadAnalyses = async () => {
    try {
      const rows = await fetchUserAnalyses();
      setAnalyses(
        (rows ?? []).map((r) => ({
          id: r.id,
          title: r.title ?? "Untitled",
          date: new Date(r.created_at).toLocaleString(undefined, { month: "short", year: "numeric" }),
        }))
      );
    } catch (_e) {
      setAnalyses([]);
    }
  };

  const handleAnalyzeSubmit = (args: { brand: string; desc: string; fileName: string | null; file: File | null }) => {
    lastInputRef.current = args;
  };

  return (
    <div className="relative">
      {!userEmail ? (
        <AuthForm />
      ) : (
        <>
          <AgentGraph
            numCommunities={NUM_COMMUNITIES}
            membersPerCommunity={MEMBERS_PER_COMMUNITY}
            maxConnectionsPerNode={10}
            selectedCommunity={selectedCommunity}
            onSelectCommunity={setSelectedCommunity}
            leftOffset={sidebarCollapsed ? 0 : 300}
            rightOffset={analysisOpen ? 420 : 0}
            analysisMap={analysisMap}
          />
          <Sidebar
            numCommunities={NUM_COMMUNITIES}
            selectedCommunity={selectedCommunity}
            onSelectCommunity={setSelectedCommunity}
            onCollapsedChange={setSidebarCollapsed}
            onRequestCreate={() => setCreateOpen(true)}
            onOpenAnalysis={() => setAnalysisOpen(true)}
            analyses={analyses}
            userEmail={userEmail}
            onSignOut={async () => {
              await supabase.auth.signOut();
            }}
            onSelectAnalysis={async (id) => {
              try {
                const rec = await fetchAnalysisById(id);
                if (rec?.output?.panelData) setPanelData(rec.output.panelData);
                // Restore agent selection map if stored
                const storedMap = (rec as any)?.agent_results?.byId ?? (rec as any)?.agent_results ?? null;
                if (storedMap && typeof storedMap === "object") {
                  setAnalysisMap(storedMap as any);
                } else {
                  setAnalysisMap(null);
                }
              } catch (_e) {
                // ignore
              }
            }}
          />
          <CreateAdModal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onOpen={() => setCreateOpen(true)}
            leftOffset={sidebarCollapsed ? 0 : 300}
            rightOffset={analysisOpen ? 420 : 0}
            onSubmit={handleAnalyzeSubmit}
          />
          <AnalysisPanel
            open={analysisOpen}
            onClose={() => setAnalysisOpen(false)}
            data={panelData}
          />
        </>
      )}
    </div>
  );
}

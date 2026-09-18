"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { AccountLink, AccountNetworkChunk, AccountNode, PLATFORM_COLORS, RISK_COLORS } from "@/lib/accountNetworkData";

interface AccountNetworkDiagramProps {
  data: AccountNetworkChunk;
  onExpand: (node: AccountNode) => void;
  onSelect: (node: AccountNode) => void;
  selectedId?: string | null;
}

type SimNode = AccountNode & d3.SimulationNodeDatum;
type SimLink = d3.SimulationLinkDatum<SimNode> & AccountLink;

const VIEW_WIDTH = 1200;
const VIEW_HEIGHT = 800;
const TOPIC_COLOR = "#4f46e5";
const SELECTED_COLOR = "#4f46e5";

function baseStrokeWidth(node: SimNode): number {
  return node.type === "load-more" ? 1.5 : 2;
}

function computeHighlightedIds(links: AccountLink[], targetId?: string | null): Set<string> {
  const highlighted = new Set<string>();
  if (!targetId) return highlighted;

  const parentOf = new Map<string, string>();
  links.forEach((l) => parentOf.set(l.target, l.source));

  let current: string | undefined = targetId;
  while (current) {
    highlighted.add(current);
    current = parentOf.get(current);
  }

  links.forEach((l) => {
    if (l.source === targetId) highlighted.add(l.target);
  });

  return highlighted;
}

function nodeBaselineOpacity(node: SimNode, chain: Set<string>): number {
  if (chain.size === 0) return 1;
  return chain.has(node.id) ? 1 : 0.3;
}

function linkBaselineOpacity(link: SimLink, chain: Set<string>): number {
  if (chain.size === 0) return 0.55;
  const source = link.source as SimNode;
  const target = link.target as SimNode;
  return chain.has(source.id) && chain.has(target.id) ? 0.85 : 0.08;
}

function radiusFor(node: SimNode): number {
  if (node.type === "topic") return 54;
  if (node.type === "platform") return 38;
  if (node.type === "load-more") return 20;
  return Math.max(16, 26 - (node.depth - 2) * 1.5);
}

function fillFor(node: SimNode): string {
  if (node.type === "topic") return TOPIC_COLOR;
  if (node.type === "platform") return node.platform ? PLATFORM_COLORS[node.platform] : "#94a3b8";
  if (node.type === "load-more") return "#f1f5f9";
  return "#ffffff";
}

function strokeFor(node: SimNode): string {
  if (node.type === "account") return node.platform ? PLATFORM_COLORS[node.platform] : "#94a3b8";
  if (node.type === "load-more") return "#94a3b8";
  return "transparent";
}

function textColorFor(node: SimNode): string {
  if (node.type === "topic" || node.type === "platform") return "#ffffff";
  if (node.type === "load-more") return "#475569";
  return "#1f2937";
}

function fontSizeFor(node: SimNode): number {
  if (node.type === "topic") return 15;
  if (node.type === "platform") return 11.5;
  if (node.type === "load-more") return 9.5;
  return Math.max(8, 10 - (node.depth - 2) * 0.4);
}

function labelFor(node: SimNode): string {
  if (node.type === "load-more") return "+ Muat lebih";
  return node.label;
}

export default function AccountNetworkDiagram({ data, onExpand, onSelect, selectedId }: AccountNetworkDiagramProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const onExpandRef = useRef(onExpand);
  const onSelectRef = useRef(onSelect);
  const selectedIdRef = useRef(selectedId);

  useEffect(() => {
    onExpandRef.current = onExpand;
    onSelectRef.current = onSelect;
  }, [onExpand, onSelect]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    if (!svgRef.current) return;

    const nodes: SimNode[] = data.nodes.map((n) => ({ ...n }));
    const links: SimLink[] = data.links.map((l) => ({ ...l }));

    const topic = nodes.find((n) => n.type === "topic");
    if (topic) {
      topic.fx = VIEW_WIDTH / 2;
      topic.fy = VIEW_HEIGHT / 2;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`);

    const container = svg.append("g");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 2.5])
      .on("zoom", (event) => container.attr("transform", event.transform));
    svg.call(zoom);

    const linkSelection = container
      .append("g")
      .attr("stroke-linecap", "round")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 1.3)
      .attr("stroke-opacity", 0.55);

    const nodeSelection = container
      .append("g")
      .selectAll<SVGGElement, SimNode>("g")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .style("cursor", (d) => (d.type === "account" || d.type === "load-more" ? "pointer" : "grab"))
      .call(
        d3
          .drag<SVGGElement, SimNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.2).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            if (d.type !== "topic") {
              d.fx = null;
              d.fy = null;
            }
          })
      )
      .on("click", (_event, d) => {
        if (d.type === "account") {
          onExpandRef.current(d);
          onSelectRef.current(d);
        } else if (d.type === "load-more") {
          onExpandRef.current(d);
        }
      })
      .on("mouseenter", function (_event, d) {
        linkSelection.attr("stroke-opacity", (l) => {
          const s = l.source as SimNode;
          const t = l.target as SimNode;
          return s.id === d.id || t.id === d.id ? 0.9 : 0.12;
        });
      })
      .on("mouseleave", () => {
        const chain = computeHighlightedIds(data.links, selectedIdRef.current);
        linkSelection.attr("stroke-opacity", (l) => linkBaselineOpacity(l, chain));
      });

    nodeSelection
      .append("circle")
      .attr("r", (d) => radiusFor(d))
      .attr("fill", (d) => fillFor(d))
      .attr("stroke", (d) => strokeFor(d))
      .attr("stroke-width", (d) => baseStrokeWidth(d))
      .attr("stroke-dasharray", (d) => (d.type === "load-more" ? "3,3" : "none"))
      .attr("filter", (d) => (d.type === "topic" ? "drop-shadow(0 4px 10px rgba(79,70,229,0.35))" : "none"));

    nodeSelection.append("title").text((d) => {
      if (d.type === "account") {
        const followers = d.meta?.followers?.toLocaleString("id-ID") ?? "-";
        const following = d.meta?.following?.toLocaleString("id-ID") ?? "-";
        const risk = d.meta?.activityRisk && d.meta.activityRisk !== "normal" ? ` • ⚠ ${d.meta.activityRisk}` : "";
        return `${d.label}\nLevel ${d.depth} • Followers: ${followers} • Following: ${following}${risk}\nKlik untuk lihat detail & following/follower`;
      }
      if (d.type === "load-more") return "Klik untuk muat akun lebih banyak";
      return d.label;
    });

    nodeSelection
      .append("foreignObject")
      .attr("x", (d) => -radiusFor(d) + 6)
      .attr("y", (d) => -radiusFor(d) + 6)
      .attr("width", (d) => (radiusFor(d) - 6) * 2)
      .attr("height", (d) => (radiusFor(d) - 6) * 2)
      .style("pointer-events", "none")
      .append("xhtml:div")
      .style("width", "100%")
      .style("height", "100%")
      .style("display", "flex")
      .style("align-items", "center")
      .style("justify-content", "center")
      .style("text-align", "center")
      .style("font-family", "inherit")
      .style("font-weight", (d) => (d.type === "account" ? "500" : "600"))
      .style("font-size", (d) => `${fontSizeFor(d)}px`)
      .style("line-height", "1.15")
      .style("color", (d) => textColorFor(d))
      .style("overflow", "hidden")
      .style("word-break", "break-word")
      .text((d) => labelFor(d));

    nodeSelection
      .filter((d) => d.type === "account" && !!d.meta?.activityRisk && d.meta.activityRisk !== "normal")
      .append("circle")
      .attr("r", 6)
      .attr("cx", (d) => radiusFor(d) * 0.72)
      .attr("cy", (d) => -radiusFor(d) * 0.72)
      .attr("fill", (d) => RISK_COLORS[d.meta!.activityRisk!])
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1.5);

    const simulation = d3
      .forceSimulation<SimNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance((d) => {
            const target = d.target as SimNode;
            if (target.type === "platform") return 150;
            return 65;
          })
          .strength(0.9)
      )
      .force(
        "charge",
        d3.forceManyBody<SimNode>().strength((d) => (d.type === "topic" ? -800 : d.type === "platform" ? -420 : -110))
      )
      .force(
        "collide",
        d3.forceCollide<SimNode>().radius((d) => radiusFor(d) + 8)
      )
      .force("x", d3.forceX(VIEW_WIDTH / 2).strength(0.02))
      .force("y", d3.forceY(VIEW_HEIGHT / 2).strength(0.02))
      .on("tick", () => {
        linkSelection
          .attr("x1", (d) => (d.source as SimNode).x ?? 0)
          .attr("y1", (d) => (d.source as SimNode).y ?? 0)
          .attr("x2", (d) => (d.target as SimNode).x ?? 0)
          .attr("y2", (d) => (d.target as SimNode).y ?? 0);

        nodeSelection.attr("transform", (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`);
      });

    return () => {
      simulation.stop();
    };
  }, [data]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
    const chain = computeHighlightedIds(data.links, selectedId);

    svg
      .selectAll<SVGGElement, SimNode>("g.node")
      .attr("opacity", (d) => nodeBaselineOpacity(d, chain))
      .select<SVGCircleElement>("circle")
      .attr("stroke", (d) => (d.id === selectedId ? SELECTED_COLOR : strokeFor(d)))
      .attr("stroke-width", (d) => (d.id === selectedId ? 3.5 : baseStrokeWidth(d)));

    svg.selectAll<SVGLineElement, SimLink>("line").attr("stroke-opacity", (d) => linkBaselineOpacity(d, chain));
  }, [data, selectedId]);

  return <svg ref={svgRef} className="w-full flex-1" role="img" aria-label="Peta jaringan akun" />;
}

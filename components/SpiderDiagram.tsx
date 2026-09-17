"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { GraphLink, GraphNode, SearchResponse, Sentiment, SourceCategory } from "@/lib/types";

interface SpiderDiagramProps {
  data: SearchResponse;
  onNodeSelect: (node: GraphNode) => void;
}

type SimNode = GraphNode & d3.SimulationNodeDatum & { childCount?: number };
type SimLink = d3.SimulationLinkDatum<SimNode> & GraphLink;

const VIEW_WIDTH = 1200;
const VIEW_HEIGHT = 800;

export const CATEGORY_COLORS: Record<SourceCategory, string> = {
  news: "#f59e0b",
  social: "#10b981",
  tiktok_live: "#f43f5e",
  web: "#0ea5e9",
};

const ROOT_COLOR = "#4f46e5";

export const SENTIMENT_COLORS: Record<Sentiment, string> = {
  positive: "#16a34a",
  negative: "#dc2626",
  neutral: "#94a3b8",
};

function radiusFor(node: SimNode): number {
  if (node.type === "root") return 58;
  if (node.type === "category") {
    const count = node.childCount ?? 0;
    return Math.min(56, Math.max(40, 36 + count * 2.5));
  }
  return 28;
}

function fillFor(node: SimNode): string {
  if (node.type === "root") return ROOT_COLOR;
  if (node.type === "category") return node.category ? CATEGORY_COLORS[node.category] : "#94a3b8";
  return "#ffffff";
}

function strokeFor(node: SimNode): string {
  if (node.type === "item") return node.category ? CATEGORY_COLORS[node.category] : "#94a3b8";
  return "transparent";
}

function textColorFor(node: SimNode): string {
  return node.type === "item" ? "#1f2937" : "#ffffff";
}

function fontSizeFor(node: SimNode): number {
  if (node.type === "root") return 15;
  if (node.type === "category") return 12;
  return 10.5;
}

function maxLabelCharsFor(node: SimNode): number {
  if (node.type === "root") return 40;
  if (node.type === "category") return 60;
  return 16;
}

function truncateLabel(label: string, maxChars: number): string {
  if (label.length <= maxChars) return label;
  return `${label.slice(0, maxChars - 1).trimEnd()}…`;
}

export default function SpiderDiagram({ data, onNodeSelect }: SpiderDiagramProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const onNodeSelectRef = useRef(onNodeSelect);

  useEffect(() => {
    onNodeSelectRef.current = onNodeSelect;
  }, [onNodeSelect]);

  useEffect(() => {
    if (!svgRef.current) return;

    const nodes: SimNode[] = data.nodes.map((n) => ({ ...n }));
    const links: SimLink[] = data.links.map((l) => ({ ...l }));

    const childCountByParentId = new Map<string, number>();
    data.links.forEach((l) => {
      childCountByParentId.set(l.source, (childCountByParentId.get(l.source) ?? 0) + 1);
    });
    nodes.forEach((n) => {
      if (n.type === "category") n.childCount = childCountByParentId.get(n.id) ?? 0;
    });

    const root = nodes.find((n) => n.type === "root");
    if (root) {
      root.fx = VIEW_WIDTH / 2;
      root.fy = VIEW_HEIGHT / 2;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`);

    const container = svg.append("g");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 2.5])
      .on("zoom", (event) => container.attr("transform", event.transform));
    svg.call(zoom);

    const linkSelection = container
      .append("g")
      .attr("stroke-linecap", "round")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", (d) => {
        const target = d.target as SimNode;
        return target.type === "category" ? 2.5 : 1.5;
      })
      .attr("stroke-opacity", 0.6);

    const nodeSelection = container
      .append("g")
      .selectAll<SVGGElement, SimNode>("g")
      .data(nodes)
      .join("g")
      .style("cursor", (d) => (d.type === "item" ? "pointer" : "grab"))
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
            if (d.type !== "root") {
              d.fx = null;
              d.fy = null;
            }
          })
      )
      .on("click", (_event, d) => {
        if (d.type === "item") onNodeSelectRef.current(d);
      })
      .on("mouseenter", function (_event, d) {
        linkSelection.attr("stroke-opacity", (l) => {
          const s = l.source as SimNode;
          const t = l.target as SimNode;
          return s.id === d.id || t.id === d.id ? 0.95 : 0.15;
        });
      })
      .on("mouseleave", () => {
        linkSelection.attr("stroke-opacity", 0.6);
      });

    nodeSelection
      .append("circle")
      .attr("r", (d) => radiusFor(d))
      .attr("fill", (d) => fillFor(d))
      .attr("stroke", (d) => strokeFor(d))
      .attr("stroke-width", 2)
      .attr("filter", (d) => (d.type === "root" ? "drop-shadow(0 4px 10px rgba(79,70,229,0.35))" : "none"));

    nodeSelection.append("title").text((d) => {
      if (d.type === "item" && d.meta?.snippet) return `${d.label}\n${d.meta.snippet}`;
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
      .style("font-weight", (d) => (d.type === "item" ? "500" : "600"))
      .style("font-size", (d) => `${fontSizeFor(d)}px`)
      .style("line-height", "1.15")
      .style("color", (d) => textColorFor(d))
      .style("overflow", "hidden")
      .style("word-break", "break-word")
      .text((d) => truncateLabel(d.label, maxLabelCharsFor(d)));

    nodeSelection
      .filter((d) => d.type === "item" && !!d.meta?.sentiment)
      .append("circle")
      .attr("r", 6)
      .attr("cx", (d) => radiusFor(d) * 0.72)
      .attr("cy", (d) => -radiusFor(d) * 0.72)
      .attr("fill", (d) => SENTIMENT_COLORS[d.meta!.sentiment!])
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
            return target.type === "category" ? 170 : 85;
          })
          .strength(0.9)
      )
      .force(
        "charge",
        d3.forceManyBody<SimNode>().strength((d) => (d.type === "root" ? -900 : d.type === "category" ? -500 : -160))
      )
      .force(
        "collide",
        d3.forceCollide<SimNode>().radius((d) => radiusFor(d) + 10)
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

  return (
    <svg
      ref={svgRef}
      className="w-full flex-1"
      role="img"
      aria-label={`Diagram hasil pencarian untuk ${data.keyword}`}
    />
  );
}

"use client";

import { useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";

export function transferFiles(data: DataTransfer | null): File[] {
  if (!data) return [];
  const fromFiles = [...data.files];
  if (fromFiles.length > 0) return fromFiles;
  const fromItems: File[] = [];
  for (const item of data.items) {
    if (item.kind === "file") {
      const file = item.getAsFile();
      if (file) fromItems.push(file);
    }
  }
  return fromItems;
}

function isFileDrag(event: DragEvent) {
  return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}

export function DropSurface({
  children,
  label,
  onFiles,
  hintFor,
  overlay = "area",
  className,
}: {
  children: ReactNode;
  label: string;
  onFiles: (files: File[], target: EventTarget | null) => void;
  hintFor?: (target: EventTarget | null) => string;
  overlay?: "page" | "area";
  className?: string;
}) {
  const [over, setOver] = useState(false);
  const [hint, setHint] = useState(label);
  const depth = useRef(0);

  useEffect(() => {
    function allow(event: Event) {
      const drag = event as globalThis.DragEvent;
      const types = drag.dataTransfer?.types;
      if (!types || !Array.from(types).includes("Files")) return;
      drag.preventDefault();
    }
    function reset() {
      depth.current = 0;
      setOver(false);
    }
    function onDrop(event: Event) {
      allow(event);
      reset();
    }
    window.addEventListener("dragover", allow);
    window.addEventListener("drop", onDrop);
    window.addEventListener("dragend", reset);
    return () => {
      window.removeEventListener("dragover", allow);
      window.removeEventListener("drop", onDrop);
      window.removeEventListener("dragend", reset);
    };
  }, []);

  function show(event: DragEvent) {
    if (!isFileDrag(event)) return false;
    event.preventDefault();
    const next = hintFor?.(event.target) ?? label;
    setHint((current) => (current === next ? current : next));
    return true;
  }

  return (
    <div
      className={["drop-surface", className, over ? "over" : ""].filter(Boolean).join(" ")}
      onDragEnter={(event) => {
        if (!show(event)) return;
        depth.current += 1;
        setOver(true);
      }}
      onDragOver={(event) => {
        if (!show(event)) return;
        event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setOver(false);
      }}
      onDrop={(event) => {
        if (!isFileDrag(event)) return;
        event.preventDefault();
        event.stopPropagation();
        depth.current = 0;
        setOver(false);
        const files = transferFiles(event.dataTransfer);
        if (files.length > 0) onFiles(files, event.target);
      }}
    >
      {children}
      {over ? (
        <div className={overlay === "page" ? "drop-overlay page" : "drop-overlay"} role="status">
          <strong>{hint}</strong>
        </div>
      ) : null}
    </div>
  );
}

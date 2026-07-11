import { useState, useMemo, useRef } from "react";
import { RESUME_TEMPLATES, TEMPLATE_CATEGORIES } from "../lib/resumeThemes";

/**
 * TemplateGallery
 *
 * Shows a categorized gallery of resume templates (Modern / Professional /
 * Minimal / Creative). Each card is a live, scaled-down preview of the
 * user's real data. Clicking a card opens a full preview with Download PDF.
 *
 * Props:
 *   resume  - the JSON Resume object (from your existing toJSONResume()).
 *   onClose - optional callback to go back to the form.
 *
 * Usage in ResumeBuilder.jsx:
 *   const [showGallery, setShowGallery] = useState(false);
 *   const resumeData = toJSONResume(form, education, experience, projects);
 *   // in Generate Resume button onClick: setShowGallery(true)
 *   {showGallery && <TemplateGallery resume={resumeData} onClose={() => setShowGallery(false)} />}
 */
export default function TemplateGallery({ resume, onClose }) {
    const [activeCat, setActiveCat] = useState("All");
    const [selected, setSelected] = useState(null); // template object
    const previewRef = useRef(null);

    const cats = ["All", ...TEMPLATE_CATEGORIES];

    const visible = useMemo(
        () =>
            activeCat === "All"
                ? RESUME_TEMPLATES
                : RESUME_TEMPLATES.filter((t) => t.category === activeCat),
        [activeCat]
    );

    // Render a template to HTML once, memoized per selection.
    const selectedHtml = useMemo(
        () => (selected ? selected.render(resume) : ""),
        [selected, resume]
    );

    // Print the selected template. The iframe already carries @page A4 rules,
    // so printing it produces a clean PDF via the browser's "Save as PDF".
    const downloadPDF = () => {
        const frame = previewRef.current;
        if (!frame) return;
        frame.contentWindow.focus();
        frame.contentWindow.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-[oklch(97%_0.006_265)]">
            {/* Top bar */}
            <div className="flex items-center justify-between gap-4 border-b border-[oklch(90%_0.01_265)] bg-white px-6 py-4">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight text-[oklch(28%_0.03_265)]">
                        Choose a template
                    </h2>
                    <p className="text-sm text-[oklch(55%_0.02_265)]">
                        {RESUME_TEMPLATES.length} designs, your details already filled in.
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="rounded-lg border border-[oklch(90%_0.01_265)] px-4 py-2 text-sm font-medium text-[oklch(45%_0.02_265)] transition hover:bg-[oklch(96%_0.01_265)]"
                >
                    Back to editing
                </button>
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto border-b border-[oklch(90%_0.01_265)] bg-white px-6 py-3">
                {cats.map((c) => (
                    <button
                        key={c}
                        onClick={() => setActiveCat(c)}
                        className={
                            "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition " +
                            (activeCat === c
                                ? "bg-[oklch(45%_0.16_265)] text-white"
                                : "text-[oklch(50%_0.02_265)] hover:bg-[oklch(95%_0.02_265)]")
                        }
                    >
                        {c}
                    </button>
                ))}
            </div>

            {/* Thumbnail grid */}
            <div className="grid flex-1 gap-6 overflow-y-auto p-6 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
                {visible.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setSelected(t)}
                        className="group flex flex-col overflow-hidden rounded-xl border border-[oklch(90%_0.01_265)] bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                        {/* Scaled A4 preview. 210mm wide scaled to fit the card. */}
                        <div className="relative aspect-[210/297] overflow-hidden bg-[oklch(96%_0.006_265)]">
                            <iframe
                                title={t.name}
                                srcDoc={t.render(resume)}
                                scrolling="no"
                                className="pointer-events-none absolute left-0 top-0 origin-top-left"
                                style={{
                                    width: "210mm",
                                    height: "297mm",
                                    transform: "scale(0.35)",
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between px-4 py-3">
                            <span className="font-medium text-[oklch(30%_0.03_265)]">{t.name}</span>
                            <span className="text-xs text-[oklch(60%_0.02_265)]">{t.category}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Full preview overlay */}
            {selected && (
                <div className="fixed inset-0 z-60 flex flex-col bg-[oklch(20%_0.02_265)/0.6] backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-4 bg-white px-6 py-3">
                        <span className="font-semibold text-[oklch(28%_0.03_265)]">
                            {selected.name}{" "}
                            <span className="font-normal text-[oklch(60%_0.02_265)]">Â· {selected.category}</span>
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelected(null)}
                                className="rounded-lg border border-[oklch(90%_0.01_265)] px-4 py-2 text-sm font-medium text-[oklch(45%_0.02_265)] hover:bg-[oklch(96%_0.01_265)]"
                            >
                                Close
                            </button>
                            <button
                                onClick={downloadPDF}
                                className="rounded-lg bg-[oklch(45%_0.16_265)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[oklch(40%_0.16_265)]"
                            >
                                Download PDF
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-6">
                        <iframe
                            ref={previewRef}
                            title="preview"
                            srcDoc={selectedHtml}
                            className="mx-auto block bg-white shadow-lg"
                            style={{ width: "210mm", height: "297mm", border: "none" }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
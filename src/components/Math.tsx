"use client";

import React, { useEffect, useRef } from "react";
import katex from "katex";

interface MathProps {
    math: string;
    block?: boolean;
}

/**
 * Renders a single LaTeX expression using KaTeX.
 * Use block=true for display equations, false (default) for inline.
 */
export default function Math({ math, block = false }: MathProps) {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        katex.render(math, ref.current, {
            displayMode: block,
            throwOnError: false,
            output: "html",
        });
    }, [math, block]);

    return <span ref={ref} />;
}

/** Characters that should not get an extra space gap next to math. */
const PUNCT = /^[.,;:!?)}\]]/;

/**
 * Renders a string that may contain inline LaTeX wrapped in $...$.
 * Plain text segments are rendered as-is; $...$ segments are rendered with KaTeX.
 *
 * Example: "Let $y_c$ be the distance and $\theta$ the angle."
 */
export function MathText({ text }: { text: string }) {
    if (!text) return null;
    const parts = text.split(/(\$[^$]+\$)/g);

    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith("$") && part.endsWith("$")) {
                    const prev = parts[i - 1] ?? "";
                    const next = parts[i + 1] ?? "";
                    // Add left gap unless the preceding text already ends with a space
                    const ml = prev.length > 0 && !prev.endsWith(" ") ? "0.2em" : "0";
                    // Add right gap unless the following text starts with punctuation or a space
                    const mr = next.length > 0 && !PUNCT.test(next) && !next.startsWith(" ") ? "0.2em" : "0";
                    return (
                        <span
                            key={i}
                            style={{
                                display: "inline-block",
                                verticalAlign: "middle",
                                lineHeight: 1,
                                marginLeft: ml,
                                marginRight: mr,
                            }}
                        >
                            <Math math={part.slice(1, -1)} />
                        </span>
                    );
                }
                return <React.Fragment key={i}>{part}</React.Fragment>;
            })}
        </>
    );
}

import { useState } from "react";

const data = [
    { month: "Jan", value: 25, x: 50, y: 150 },
    { month: "Feb", value: 40, x: 110, y: 120 },
    { month: "Mar", value: 80, x: 170, y: 60 },
    { month: "Apr", value: 60, x: 230, y: 90 },
    { month: "May", value: 100, x: 290, y: 30 },
];

export default function Rough() {
    const [tooltip, setTooltip] = useState<{
        x: number;
        y: number;
        month: string;
        value: number;
    } | null>(null);

    const points = data.map(d => `${d.x},${d.y}`).join(" ");

    return (
        <div className="relative w-fit">
            <svg width="400" height="250">
                {/* Axes */}
                <line x1="50" y1="20" x2="50" y2="180" stroke="#666" />
                <line x1="50" y1="180" x2="350" y2="180" stroke="#666" />

                {/* Graph */}
                <polyline
                    points={points}
                    fill="none"
                    stroke="#9333ea"
                    strokeWidth="4"
                />

                {/* Points */}
                {data.map((d, i) => (
                    <circle
                        key={i}
                        cx={d.x}
                        cy={d.y}
                        r="6"
                        fill="#9333ea"
                        className="cursor-pointer"
                        onMouseEnter={() =>
                            setTooltip({
                                x: d.x,
                                y: d.y,
                                month: d.month,
                                value: d.value,
                            })
                        }
                        onMouseLeave={() => setTooltip(null)}
                    />
                ))}

                {/* Labels */}
                {data.map((d, i) => (
                    <text key={i} x={d.x - 10} y="205" fontSize="12">
                        {d.month}
                    </text>
                ))}
            </svg>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="absolute bg-[var(--back-secondary)] border border-purple-500 rounded-md px-3 py-2 text-sm shadow-lg pointer-events-none"
                    style={{
                        left: tooltip.x + 20,
                        top: tooltip.y - 10,
                    }}
                >
                    <div>{tooltip.month}</div>
                    <div> ₹{tooltip.value}k</div>
                </div>
            )}
        </div>
    );
}
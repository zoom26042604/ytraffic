import { LineChart, Line as RLine, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Line, Selection } from '../App';

type Props = {
    selected: Selection;
    line: Line;
    onLineChange: (line: Line) => void;
};

type Point = { label: string; traffic: number; temp: number };

const WEEK_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const YEAR_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

function mockPoints(selected: Selection, line: Line): Point[] {
    const [granularity, period, unit] = selected as [string, string, string];

    const periodMult: Record<string, number> = {
        'Matin': 1.5,
        'Après-midi': 1.0,
        'Soir': 1.7,
    };
    const baseTraffic = line === 'A' ? 420 : 340;
    const tempBaseC = 16;

    const count =
        granularity === 'Semaine' ? 7 :
        granularity === 'Mois' ? 30 : 12;

    const labels = (i: number) => {
        if (granularity === 'Semaine') return WEEK_LABELS[i];
        if (granularity === 'Année') return YEAR_LABELS[i];
        return String(i + 1);
    };

    return Array.from({ length: count }, (_, i) => {
        const noise = ((i * 37 + (line === 'A' ? 11 : 23)) % 80) - 40;
        const traffic = Math.max(0, Math.round(baseTraffic * (periodMult[period] ?? 1) + noise));

        const tempNoise = ((i * 13 + (line === 'A' ? 5 : 17)) % 20) - 10;
        const tempC = tempBaseC + tempNoise * 0.6;
        const temp = unit === 'Fahrenheit' ? Math.round((tempC * 9) / 5 + 32) : Math.round(tempC);

        return { label: labels(i), traffic, temp };
    });
}

export function Graph({ selected, line, onLineChange }: Props) {
    const allSelected = selected.every((s) => s !== null);
    const points = allSelected ? mockPoints(selected, line) : [];
    const unitSuffix = selected[2] === 'Fahrenheit' ? '°F' : '°C';

    const lineButton = (target: Line) => (
        <button
            onClick={() => onLineChange(target)}
            className={`
                border-purple-300 border-4 rounded-4xl
                px-5 py-1 sm:px-10 md:px-15 lg:px-20
                transition-colors
                ${line === target ? 'bg-purple-400 text-white' : 'bg-purple-300'}
            `}
        >
            Ligne {target}
        </button>
    );

    return (
        <div className="flex flex-1 justify-center items-center py-10">
            <div className="relative border-purple-300 bg-[#272727] border-4 rounded-4xl
                w-80 h-80
                sm:w-180 sm:h-120
                md:w-200 md:h-150
                lg:w-350 lg:h-150">

                <div className="absolute -top-5 left-1/2 -translate-x-1/2
                    flex gap-5 sm:gap-15 md:gap-25 lg:gap-35 w-max">
                    {lineButton('A')}
                    {lineButton('B')}
                </div>

                <div className="absolute inset-0 pt-10 pb-6 px-4 sm:px-8">
                    {allSelected ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={points} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                                <CartesianGrid stroke="#9C95DC22" strokeDasharray="3 3" />
                                <XAxis dataKey="label" stroke="#9C95DC" tick={{ fill: '#9C95DC', fontSize: 12 }} />
                                <YAxis yAxisId="left" stroke="#9C95DC" tick={{ fill: '#9C95DC', fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#F5A623" tick={{ fill: '#F5A623', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ background: '#1a1a1a', border: '1px solid #9C95DC', borderRadius: 12 }}
                                    labelStyle={{ color: '#fff' }}
                                    formatter={(value, name) => {
                                        if (name === 'temp') return [`${value} ${unitSuffix}`, 'Température'];
                                        return [value as number, 'Affluence'];
                                    }}
                                />
                                <RLine yAxisId="left" type="monotone" dataKey="traffic" stroke="#9C95DC" strokeWidth={3} dot={{ r: 3 }} />
                                <RLine yAxisId="right" type="monotone" dataKey="temp" stroke="#F5A623" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-[#9C95DC] text-center px-6">
                            Sélectionne <span className="mx-1 font-semibold">Date</span>, <span className="mx-1 font-semibold">Horaire</span> et <span className="mx-1 font-semibold">Température</span> pour afficher le graphique
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

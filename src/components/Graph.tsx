import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line as RLine, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Selection } from '../App';

type Stop = { id: string; name: string };
type ApiPoint = {
    label: string;
    affluence: number;
    temperature: number | null;
    humidity: number | null;
    rain: number | null;
};

type Props = {
    selected: Selection;
    stopId: string;
    onStopChange: (stopId: string) => void;
};

const API_BASE = 'http://localhost:5000/api';
const AFFLUENCE_URL = `${API_BASE}/affluence`;
const SCORE_URL = `${API_BASE}/model_score`;

const STOPS_BY_LINE: Record<string, Stop[]> = {
    A: [
        { id: 'A01', name: 'Balma-Gramont' },
        { id: 'A02', name: 'Argoulets' },
        { id: 'A03', name: 'Roseraie' },
        { id: 'A04', name: 'Jolimont' },
        { id: 'A05', name: 'Marengo-SNCF' },
        { id: 'A06', name: 'Jean Jaurès' },
        { id: 'A07', name: 'Capitole' },
        { id: 'A08', name: 'Esquirol' },
        { id: 'A09', name: 'Saint-Cyprien-République' },
        { id: "A10", name: "Patte-d'Oie" },
        { id: 'A11', name: 'Arènes' },
        { id: 'A12', name: 'Fontaine-Lestang' },
        { id: 'A13', name: 'Mermoz' },
        { id: 'A14', name: 'Bagatelle' },
        { id: 'A15', name: 'Mirail-Université' },
        { id: 'A16', name: 'Reynerie' },
        { id: 'A17', name: 'Bellefontaine' },
        { id: 'A18', name: 'Basso-Cambo' },
    ],
    B: [
        { id: 'B01', name: 'Borderouge' },
        { id: 'B02', name: 'Trois Cocus' },
        { id: 'B03', name: 'La Vache' },
        { id: 'B04', name: 'Barrière de Paris' },
        { id: 'B05', name: 'Minimes-Claude Nougaro' },
        { id: 'B06', name: 'Canal du Midi' },
        { id: 'B07', name: 'Compans-Caffarelli' },
        { id: "B08", name: "Jeanne d'Arc" },
        { id: 'B09', name: 'Jean Jaurès' },
        { id: 'B10', name: 'François Verdier' },
        { id: 'B11', name: 'Carmes' },
        { id: 'B12', name: 'Palais de Justice' },
        { id: 'B13', name: 'Saint-Michel-Marcel Langer' },
        { id: 'B14', name: 'Empalot' },
        { id: 'B15', name: 'Saint-Agne SNCF' },
        { id: 'B16', name: 'Saouzelong' },
        { id: 'B17', name: 'Rangueil' },
        { id: 'B18', name: 'Faculté de Pharmacie' },
        { id: 'B19', name: 'Université Paul Sabatier' },
        { id: 'B20', name: 'Ramonville' },
    ],
};

const GRANULARITY_PARAM: Record<string, string> = {
    Semaine: 'week',
    Mois: 'month',
    Année: 'year',
};

const PERIOD_PARAM: Record<string, string> = {
    Matin: 'morning',
    'Après-midi': 'afternoon',
    Soir: 'evening',
};

type ToggleKey = 'temperature' | 'rain' | 'humidity';

const TOGGLES: { key: ToggleKey; label: string; color: string }[] = [
    { key: 'temperature', label: 'Température', color: '#F5A623' },
    { key: 'rain', label: 'Pluie', color: '#3FA9F5' },
    { key: 'humidity', label: 'Humidité', color: '#7ED321' },
];

function todayLocal() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 10);
}

function toFahrenheit(c: number | null): number | null {
    return c == null ? null : Math.round((c * 9) / 5 + 32);
}

export function Graph({ selected, stopId, onStopChange }: Props) {
    const [points, setPoints] = useState<ApiPoint[]>([]);
    const [score, setScore] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeToggles, setActiveToggles] = useState<Record<ToggleKey, boolean>>({
        temperature: true,
        rain: false,
        humidity: false,
    });

    const allSelected = selected.every((s) => s !== null);
    const unit = selected[2];
    const unitSuffix = unit === 'Fahrenheit' ? '°F' : '°C';

    useEffect(() => {
        if (!allSelected) return;

        const [granularity, period] = selected as [string, string, string];
        const date = todayLocal();
        const params = new URLSearchParams({
            stop_id: stopId,
            granularity: GRANULARITY_PARAM[granularity],
            period: PERIOD_PARAM[period],
            date,
        });
        const controller = new AbortController();

        setIsLoading(true);
        setError(null);

        fetch(`${AFFLUENCE_URL}?${params.toString()}`, { signal: controller.signal })
            .then(async (response) => {
                if (!response.ok) throw new Error(`Erreur API ${response.status}`);
                const data = await response.json();
                if (!Array.isArray(data)) throw new Error('Réponse API invalide');
                setPoints(data as ApiPoint[]);
            })
            .catch((err: unknown) => {
                if (err instanceof DOMException && err.name === 'AbortError') return;
                setPoints([]);
                setError(err instanceof Error ? err.message : 'Impossible de charger les données');
            })
            .finally(() => {
                if (!controller.signal.aborted) setIsLoading(false);
            });

        return () => controller.abort();
    }, [allSelected, selected, stopId]);

    useEffect(() => {
        const controller = new AbortController();
        fetch(SCORE_URL, { signal: controller.signal })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => setScore(data?.score ?? null))
            .catch(() => setScore(null));
        return () => controller.abort();
    }, []);

    const chartData = useMemo(
        () =>
            points.map((p) => ({
                ...p,
                temperature: unit === 'Fahrenheit' ? toFahrenheit(p.temperature) : p.temperature,
            })),
        [points, unit],
    );

    const toggle = (key: ToggleKey) =>
        setActiveToggles((s) => ({ ...s, [key]: !s[key] }));

    const tooltipFormatter = (value: unknown, name: unknown): [string, string] => {
        const v = value == null ? '—' : String(value);
        if (name === 'temperature') return [`${v} ${unitSuffix}`, 'Température'];
        if (name === 'humidity') return [`${v} %`, 'Humidité'];
        if (name === 'rain') return [`${v} mm`, 'Pluie'];
        return [v, 'Affluence'];
    };

    return (
        <div className="relative z-0 flex flex-col items-center pt-10 pb-24">
            <div className="relative border-purple-300 bg-[#272727] border-4 rounded-4xl
                w-80 h-80
                sm:w-180 sm:h-120
                md:w-200 md:h-150
                lg:w-350 lg:h-150">

                <div className="absolute -top-6 left-1/2 z-10 w-72 -translate-x-1/2 sm:w-90">
                    <select
                        aria-label="Station"
                        value={stopId}
                        onChange={(event) => onStopChange(event.target.value)}
                        className="h-12 w-full rounded-4xl border-4 border-purple-300 bg-[#272727] px-5 text-center text-sm text-[#9C95DC] outline-none sm:text-base"
                    >
                        {Object.entries(STOPS_BY_LINE).map(([line, stops]) => (
                            <optgroup key={line} label={`Ligne ${line}`}>
                                {stops.map((stop) => (
                                    <option key={stop.id} value={stop.id}>
                                        {stop.name}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>

                <div className="absolute top-3 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 sm:top-4 sm:left-6 sm:right-6">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {TOGGLES.map((t) => {
                            const active = activeToggles[t.key];
                            return (
                                <button
                                    key={t.key}
                                    onClick={() => toggle(t.key)}
                                    className={`px-2 py-1 text-[10px] rounded-full border-2 transition sm:px-3 sm:text-xs ${
                                        active
                                            ? 'border-transparent text-white'
                                            : 'border-[#9C95DC] text-[#9C95DC] bg-transparent hover:bg-[#9C95DC]/10'
                                    }`}
                                    style={active ? { backgroundColor: t.color } : undefined}
                                >
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                    {score !== null && (
                        <div className="rounded-full border border-[#9C95DC] px-2 py-1 text-[10px] text-[#9C95DC] sm:px-3 sm:text-xs">
                            Précision IA : {Math.round(score * 100)}%
                        </div>
                    )}
                </div>

                <div className="absolute inset-0 pt-20 pb-6 px-4 sm:pt-24 sm:px-8">
                    {allSelected && isLoading ? (
                        <div className="flex h-full items-center justify-center text-[#9C95DC] text-center px-6">
                            Chargement des données...
                        </div>
                    ) : allSelected && error ? (
                        <div className="flex h-full items-center justify-center text-red-300 text-center px-6">
                            {error}
                        </div>
                    ) : allSelected && chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                                <CartesianGrid stroke="#9C95DC22" strokeDasharray="3 3" />
                                <XAxis dataKey="label" stroke="#9C95DC" tick={{ fill: '#9C95DC', fontSize: 12 }} />
                                <YAxis yAxisId="affluence" stroke="#9C95DC" tick={{ fill: '#9C95DC', fontSize: 12 }} />
                                <YAxis
                                    yAxisId="temp"
                                    orientation="right"
                                    stroke="#F5A623"
                                    tick={{ fill: '#F5A623', fontSize: 12 }}
                                    hide={!activeToggles.temperature}
                                />
                                <YAxis yAxisId="humidity" orientation="right" hide />
                                <YAxis yAxisId="rain" orientation="right" hide />
                                <Tooltip
                                    contentStyle={{ background: '#1a1a1a', border: '1px solid #9C95DC', borderRadius: 12 }}
                                    labelStyle={{ color: '#fff' }}
                                    formatter={tooltipFormatter}
                                />
                                <RLine
                                    yAxisId="affluence"
                                    type="monotone"
                                    dataKey="affluence"
                                    stroke="#9C95DC"
                                    strokeWidth={3}
                                    dot={{ r: 3 }}
                                />
                                {activeToggles.temperature && (
                                    <RLine
                                        yAxisId="temp"
                                        type="monotone"
                                        dataKey="temperature"
                                        stroke="#F5A623"
                                        strokeWidth={2}
                                        strokeDasharray="4 4"
                                        dot={false}
                                        connectNulls
                                    />
                                )}
                                {activeToggles.rain && (
                                    <RLine
                                        yAxisId="rain"
                                        type="monotone"
                                        dataKey="rain"
                                        stroke="#3FA9F5"
                                        strokeWidth={2}
                                        dot={false}
                                        connectNulls
                                    />
                                )}
                                {activeToggles.humidity && (
                                    <RLine
                                        yAxisId="humidity"
                                        type="monotone"
                                        dataKey="humidity"
                                        stroke="#7ED321"
                                        strokeWidth={2}
                                        dot={false}
                                        connectNulls
                                    />
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    ) : allSelected ? (
                        <div className="flex h-full items-center justify-center text-[#9C95DC] text-center px-6">
                            Aucune donnée disponible
                        </div>
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

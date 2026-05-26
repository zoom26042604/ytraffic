import { useEffect, useState } from 'react';
import { LineChart, Line as RLine, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Selection } from '../App';

type Stop = { id: string; name: string };
type AffluencePoint = { label: string; affluence: number };
type ChartPoint = AffluencePoint & { temp: number };

type Props = {
    selected: Selection;
    stopId: string;
    onStopChange: (stopId: string) => void;
};

const API_URL = '/api/affluence';

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

function todayLocal() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 10);
}

function withTemperature(points: AffluencePoint[], stopId: string, unit: string): ChartPoint[] {
    return points.map((point, index) => {
        const tempC = 16 + (((index * 13 + stopId.charCodeAt(2)) % 20) - 10) * 0.6;
        const temp = unit === 'Fahrenheit'
            ? Math.round((tempC * 9) / 5 + 32)
            : Math.round(tempC);

        return { ...point, temp };
    });
}

export function Graph({ selected, stopId, onStopChange }: Props) {
    const [points, setPoints] = useState<ChartPoint[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const allSelected = selected.every((s) => s !== null);
    const unitSuffix = selected[2] === 'Fahrenheit' ? '°F' : '°C';

    useEffect(() => {
        if (!allSelected) {
            return;
        }

        const [granularity, period, unit] = selected as [string, string, string];
        const date = todayLocal();
        const params = new URLSearchParams({
            stop_id: stopId,
            granularity: GRANULARITY_PARAM[granularity],
            period: PERIOD_PARAM[period],
            date,
        });
        const controller = new AbortController();

        Promise.resolve<Response | null>(null)
            .then(() => {
                if (controller.signal.aborted) return null;
                setIsLoading(true);
                setError(null);
                return fetch(`${API_URL}?${params.toString()}`, { signal: controller.signal });
            })
            .then(async (response) => {
                if (!response) return;

                if (!response.ok) {
                    throw new Error(`Erreur API ${response.status}`);
                }

                const data = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error('Réponse API invalide');
                }

                setPoints(withTemperature(data, stopId, unit));
            })
            .catch((err: unknown) => {
                if (err instanceof DOMException && err.name === 'AbortError') return;
                setPoints([]);
                setError(err instanceof Error ? err.message : 'Impossible de charger les données');
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            });

        return () => controller.abort();
    }, [allSelected, selected, stopId]);

    return (
        <div className="relative z-0 flex flex-none justify-center items-center pt-10 pb-24">
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

                <div className="absolute inset-0 pt-10 pb-6 px-4 sm:px-8">
                    {allSelected && isLoading ? (
                        <div className="flex h-full items-center justify-center text-[#9C95DC] text-center px-6">
                            Chargement des données...
                        </div>
                    ) : allSelected && error ? (
                        <div className="flex h-full items-center justify-center text-red-300 text-center px-6">
                            {error}
                        </div>
                    ) : allSelected && points.length > 0 ? (
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
                                <RLine yAxisId="left" type="monotone" dataKey="affluence" stroke="#9C95DC" strokeWidth={3} dot={{ r: 3 }} />
                                <RLine yAxisId="right" type="monotone" dataKey="temp" stroke="#F5A623" strokeWidth={2} strokeDasharray="4 4" dot={false} />
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

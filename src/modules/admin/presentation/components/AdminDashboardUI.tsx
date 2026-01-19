'use client';

import { useState } from "react";
import {
    Users,
    TrendingUp,
    Activity,
    Dumbbell,
    LogOut,
    Calendar,
    ChevronDown,
    Award
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import { getAdminStatsAction, logoutAdminAction } from "@/app/_actions/admin";

interface AdminDashboardUIProps {
    initialData: any;
}

export function AdminDashboardUI({ initialData }: AdminDashboardUIProps) {
    const [stats, setStats] = useState(initialData);
    const [period, setPeriod] = useState(12);
    const [isLoading, setIsLoading] = useState(false);

    const handlePeriodChange = async (months: number) => {
        setPeriod(months);
        setIsLoading(true);
        const result = await getAdminStatsAction(months);
        if (result.success) {
            setStats(result.data);
        }
        setIsLoading(false);
    };

    const handleLogout = async () => {
        await logoutAdminAction();
    };

    if (!stats) return null;

    // Data for Gender Pie Chart
    const genderData = [
        { name: 'Hombres', value: stats.genderStats.male, color: '#3b82f6' },
        { name: 'Mujeres', value: stats.genderStats.female, color: '#ec4899' },
        { name: 'Otros', value: stats.genderStats.other, color: '#8b5cf6' },
    ];

    // Data for Active Users Pie Chart
    const activeGenderData = [
        { name: 'Hombres', value: stats.activeGenderStats.male, color: '#3b82f6' },
        { name: 'Mujeres', value: stats.activeGenderStats.female, color: '#ec4899' },
        { name: 'Otros', value: stats.activeGenderStats.other, color: '#8b5cf6' },
    ];

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-black text-green-500 uppercase tracking-widest">Sistema Operativo</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic">Control Panel</h1>
                    <p className="text-zinc-500 font-medium">Estadísticas globales y métricas de negocio</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <select
                            value={period}
                            onChange={(e) => handlePeriodChange(Number(e.target.value))}
                            className="appearance-none bg-zinc-900 border border-zinc-800 text-white pl-10 pr-10 py-3 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-brand-primary outline-none cursor-pointer transition-all"
                        >
                            <option value={1}>Último mes</option>
                            <option value={3}>Últimos 3 meses</option>
                            <option value={6}>Últimos 6 meses</option>
                            <option value={12}>Último año</option>
                        </select>
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                    </div>

                    <button
                        onClick={handleLogout}
                        className="bg-zinc-900 hover:bg-zinc-800 p-3 rounded-2xl border border-zinc-800 transition-all text-red-500"
                        title="Cerrar sesión"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card
                    title="Usuarios Totales"
                    value={stats.totalUsers}
                    icon={<Users className="h-6 w-6 text-brand-primary" />}
                    description="Registros históricos"
                />
                <Card
                    title="Usuarios Periodo"
                    value={stats.periodUsers}
                    icon={<TrendingUp className="h-6 w-6 text-green-500" />}
                    description={`Nuevos en ${period} meses`}
                />
                <Card
                    title="Activos Mes"
                    value={stats.activeUsersCount}
                    icon={<Activity className="h-6 w-6 text-orange-500" />}
                    description="Han entrenado este mes"
                />
                <Card
                    title="Carga Total"
                    value={`${(stats.totalTonnage / 1000).toFixed(1)}T`}
                    icon={<Dumbbell className="h-6 w-6 text-purple-500" />}
                    description="Tonelaje movido por la comunidad"
                    isPremium
                />
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Growth / Gender Chart */}
                <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black uppercase italic tracking-tight">Distribución por Género</h3>
                            <p className="text-sm text-zinc-500 font-medium">Usuarios registrados en el periodo seleccionado</p>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={genderData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '16px', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-black uppercase italic tracking-tight mb-6">Métricas del Mes</h3>
                        <div className="space-y-6">
                            <StatRow
                                label="Nuevas Rutinas"
                                value={stats.routinesCount}
                                icon={<Award className="h-5 w-5 text-zinc-400" />}
                                breakdown={stats.routinesGenderStats}
                            />
                            <StatRow
                                label="Nuevos Ejercicios"
                                value={stats.exercisesCount}
                                icon={<Dumbbell className="h-5 w-5 text-zinc-400" />}
                                breakdown={stats.exercisesGenderStats}
                            />
                            <div className="h-px bg-zinc-800 my-4" />
                            <div className="text-center p-4 bg-brand-primary/10 rounded-2xl border border-brand-primary/20">
                                <p className="text-xs font-black text-brand-primary uppercase tracking-widest mb-1">Engagement</p>
                                <p className="text-3xl font-black">{((stats.activeUsersCount / stats.totalUsers) * 100).toFixed(1)}%</p>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Usuarios Activos / Totales</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Popular Exercises & Active User Gender */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Popular Exercises */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
                    <h3 className="text-xl font-black uppercase italic tracking-tight mb-8">Top Ejercicios (Periodo)</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.topExercises} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 12, fontWeight: 'bold' }}
                                    width={120}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                                />
                                <Bar dataKey="count" fill="#EAB308" radius={[0, 10, 10, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Active Gender Chart */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
                    <h3 className="text-xl font-black uppercase italic tracking-tight mb-8">Género Usuarios Activos</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={activeGenderData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                >
                                    {activeGenderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '16px', fontWeight: 'bold' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <footer className="text-center text-zinc-700 text-[10px] font-black uppercase tracking-[0.2em] pt-10">
                DataGymRoutines Enterprise Dashboard - Propiedad de srbit
            </footer>
        </div>
    );
}

function Card({ title, value, icon, description, isPremium }: any) {
    return (
        <div className={`relative overflow-hidden bg-zinc-900/50 border ${isPremium ? 'border-brand-primary' : 'border-zinc-800'} rounded-3xl p-6 transition-all hover:scale-[1.02] hover:shadow-xl`}>
            {isPremium && (
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl" />
            )}
            <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl ${isPremium ? 'bg-brand-primary/20' : 'bg-zinc-800'}`}>
                    {icon}
                </div>
                <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest">{title}</h4>
            </div>
            <div className="space-y-1">
                <div className="text-4xl font-black tracking-tighter">{value}</div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tight">{description}</p>
            </div>
        </div>
    );
}

function StatRow({ label, value, icon, breakdown }: any) {
    return (
        <div className="space-y-2 p-4 bg-zinc-800/30 rounded-2xl border border-zinc-800/50">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {icon}
                    <span className="text-sm font-bold text-zinc-400">{label}</span>
                </div>
                <span className="text-lg font-black">{value}</span>
            </div>
            {breakdown && (
                <div className="flex gap-4 pt-2 border-t border-zinc-800/50">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-bold text-zinc-500">{breakdown.male}M</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-pink-500" />
                        <span className="text-[10px] font-bold text-zinc-500">{breakdown.female}F</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-[10px] font-bold text-zinc-500">{breakdown.other}O</span>
                    </div>
                </div>
            )}
        </div>
    );
}

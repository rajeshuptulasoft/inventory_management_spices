export default function GlassStatCard({ title, value, subtitle, icon, trend, accent = 'orange' }) {
  const accents = {
    orange: 'from-orange-500/20 to-amber-600/10 border-orange-500/30 text-orange-400',
    blue: 'from-blue-500/20 to-cyan-600/10 border-blue-500/30 text-blue-400',
    green: 'from-emerald-500/20 to-green-600/10 border-emerald-500/30 text-emerald-400',
    red: 'from-red-500/20 to-rose-600/10 border-red-500/30 text-red-400',
    purple: 'from-violet-500/20 to-purple-600/10 border-violet-500/30 text-violet-400',
  };

  return (
    <div className={`glass-card bg-gradient-to-br ${accents[accent]} border backdrop-blur-xl p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5 group-hover:bg-white/10 transition" />
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2 text-white dark:text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && <p className={`text-xs mt-2 font-medium ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</p>}
        </div>
        {icon && <div className="text-3xl opacity-80">{icon}</div>}
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, History, Trophy, RefreshCcw, Calendar as CalendarIcon, X, Check, Clock, TrendingUp } from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfDay } from 'date-fns'

interface Record {
  timestamp: number;
}

function App() {
  const [records, setRecords] = useState<Record[]>([])
  const [showConfirm, setShowConfirm] = useState(false)
  const [view, setView] = useState<'main' | 'calendar'>('main')

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem('rootine_records')
    if (saved) {
      setRecords(JSON.parse(saved))
    }
  }, [])

  // Save data
  useEffect(() => {
    localStorage.setItem('rootine_records', JSON.stringify(records))
  }, [records])

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const todayRecords = records.filter(r => format(r.timestamp, 'yyyy-MM-dd') === todayStr)

  const getPeriodCount = (days: number) => {
    const cutoff = subDays(new Date(), days).getTime()
    return records.filter(r => r.timestamp >= cutoff).length
  }

  const stats = useMemo(() => ({
    d3: getPeriodCount(3),
    d7: getPeriodCount(7),
    d30: getPeriodCount(30),
    lastRecord: records.length > 0 ? format(records[records.length - 1].timestamp, 'HH:mm') : '--:--',
    avgInterval: calculateAvgInterval(records)
  }), [records])

  function calculateAvgInterval(recs: Record[]) {
    if (recs.length < 2) return 0
    const last10 = recs.slice(-10)
    if (last10.length < 2) return 0

    let total = 0
    for (let i = 1; i < last10.length; i++) {
      total += last10[i].timestamp - last10[i - 1].timestamp
    }
    return total / (last10.length - 1) / (1000 * 60 * 60) // in hours
  }

  const handleAddClick = () => setShowConfirm(true)

  const confirmAdd = () => {
    const newRecord = { timestamp: Date.now() }
    setRecords(prev => [...prev, newRecord])
    setShowConfirm(false)
    if ('vibrate' in navigator) navigator.vibrate(20)
  }

  const handleReset = () => {
    if (confirm('모든 기록을 초기화할까요?')) {
      setRecords([])
      localStorage.removeItem('rootine_records')
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center bg-[#F8F9FC] text-[#1D1D1F] p-6 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[150%] h-[50%] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-accent/10 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="w-full flex justify-between items-center z-20 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-xl shadow-accent/20">
            <Play className="w-5 h-5 text-white fill-current" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-[#1D1D1F]">Rootine</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView(view === 'main' ? 'calendar' : 'main')}
            className="p-3 rounded-2xl glass text-[#86868B] hover:text-[#1D1D1F] transition-colors"
          >
            {view === 'main' ? <CalendarIcon className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
          </button>
          <button
            onClick={handleReset}
            className="p-3 rounded-2xl glass text-[#86868B] hover:text-[#1D1D1F] transition-colors"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {view === 'main' ? (
          <motion.div
            key="main"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 w-full flex flex-col items-center justify-between"
          >
            {/* Quick Stats Bar */}
            <div className="w-full grid grid-cols-4 gap-2 mb-8">
              <StatItem label="3D" value={stats.d3} />
              <StatItem label="7D" value={stats.d7} />
              <StatItem label="30D" value={stats.d30} />
              <StatItem label="L-REC" value={stats.lastRecord} />
            </div>

            {/* Main Counter Hub */}
            <div className="relative flex flex-col items-center justify-center flex-1">
              <div className="absolute inset-0 bg-accent/10 blur-[80px] rounded-full animate-pulse-soft" />

              <div className="relative w-80 h-80 rounded-full glass flex flex-col items-center justify-center gap-2 border border-white shadow-[0_20px_60px_rgba(0,122,255,0.08)]">
                <div className="absolute inset-4 rounded-full border border-accent/5 pointer-events-none" />
                <span className="text-xs font-bold text-[#86868B] tracking-[0.4em] uppercase">Today's Focus</span>
                <motion.span
                  key={todayRecords.length}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-[120px] font-black leading-none tracking-tighter text-[#1D1D1F]"
                >
                  {todayRecords.length}
                </motion.span>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/10">
                  <Clock className="w-3 h-3 text-accent" />
                  <span className="text-[10px] font-black text-accent">AVG. {stats.avgInterval.toFixed(1)}H CYCLE</span>
                </div>
              </div>

              {/* Orbital Decorations */}
              <div className="absolute inset-[-40px] rounded-full border-t border-accent/10 animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-[-60px] rounded-full border-b border-accent/5 animate-[spin_15s_linear_infinite_reverse]" />
            </div>

            {/* Huge Record Button */}
            <div className="w-full max-w-sm mt-12 pb-8">
              <button
                onClick={handleAddClick}
                className="w-full py-8 rounded-[40px] bg-accent text-white font-black text-2xl shadow-[0_12px_40px_rgba(0,122,255,0.3)] active:scale-95 transition-all flex items-center justify-center gap-4 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <PlusIcon className="w-8 h-8" />
                <span>RECORD NOW</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex-1 w-full overflow-y-auto pb-20 no-scrollbar"
          >
            <Calendar records={records} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
          >
            <div className="absolute inset-0 bg-white/60 backdrop-blur-xl" onClick={() => setShowConfirm(false)} />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-[320px] rounded-[40px] glass p-8 border border-white z-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Play className="w-32 h-32 text-accent fill-current translate-x-12 -translate-y-12" />
              </div>

              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-accent" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight text-[#1D1D1F]">기록하시겠습니까?</h3>
                  <p className="text-[#86868B] text-sm font-bold">확인 버튼을 누르면 기록이 추가됩니다.</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-4 rounded-2xl bg-[#F2F2F7] text-[#86868B] font-black hover:bg-[#E5E5EA] transition-colors"
                  >
                    아니오
                  </button>
                  <button
                    onClick={confirmAdd}
                    className="flex-1 py-4 rounded-2xl bg-accent text-white font-black shadow-lg shadow-accent/20"
                  >
                    예
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatItem({ label, value }: { label: string, value: number | string }) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col items-center gap-1 border border-white">
      <span className="text-[10px] font-black text-[#86868B] tracking-widest">{label}</span>
      <span className="text-lg font-black tracking-tight text-[#1D1D1F]">{value}</span>
    </div>
  )
}

function Calendar({ records }: { records: Record[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  })

  return (
    <div className="glass rounded-[40px] p-8 space-y-8 border border-white">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black uppercase tracking-tighter text-[#1D1D1F]">Activity Grid</h3>
        <span className="text-accent font-black tracking-tight">{format(currentMonth, 'MMMM yyyy')}</span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="text-center text-[10px] font-black text-[#86868B] mb-2">{d}</div>
        ))}
        {days.map(day => {
          const dayCount = records.filter(r => isSameDay(r.timestamp, day)).length
          const isToday = isSameDay(day, new Date())

          return (
            <div
              key={day.toISOString()}
              className={`aspect-square rounded-xl flex items-center justify-center relative
                ${dayCount > 0 ? 'bg-accent/10 border border-accent/10' : 'bg-[#F2F2F7] border border-transparent'}
                ${isToday ? 'outline outline-2 outline-accent outline-offset-2' : ''}
              `}
            >
              <span className={`text-xs font-bold ${dayCount > 0 ? 'text-accent' : 'text-[#86868B]'}`}>
                {format(day, 'd')}
              </span>
              {dayCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-white text-[8px] font-black flex items-center justify-center shadow-lg">
                  {dayCount}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="pt-4 border-t border-[#F2F2F7]">
        <div className="flex items-center gap-3 text-[#1D1D1F]/40 mb-4">
          <TrendingUp className="w-4 h-4 text-accent" />
          <span className="text-xs font-black uppercase tracking-widest text-[#86868B]">Efficiency Trend</span>
        </div>
        <div className="space-y-2">
          {[...records].reverse().slice(0, 5).map((r, i) => (
            <div key={i} className="flex justify-between items-center text-sm py-2">
              <span className="text-[#86868B] font-bold">{format(r.timestamp, 'MMM dd HH:mm:ss')}</span>
              <span className="text-accent font-black">LOGGED</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export default App

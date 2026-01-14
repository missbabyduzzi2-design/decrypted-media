
import React, { useState, useEffect, useRef } from 'react';

// --- Helper Functions ---

const getMoonPhase = (date: Date) => {
    // Correctly handle the date object for moon calculations (UTC consistent)
    let year = date.getUTCFullYear();
    let month = date.getUTCMonth() + 1;
    let day = date.getUTCDate();

    if (month < 3) {
        year--;
        month += 12;
    }

    ++month;
    let c = 365.25 * year;
    let e = 30.6 * month;
    let jd = c + e + day - 694039.09; // jd is total days elapsed
    jd /= 29.5305882; // divide by the moon cycle
    let b = parseInt(jd.toString()); // int(jd) -> b, take integer part of jd
    jd -= b; // subtract integer part to leave fractional part of original jd
    b = Math.round(jd * 8); // scale fraction from 0-8 and round

    if (b >= 8) b = 0; // 0 and 8 are the same so turn 8 into 0

    switch (b) {
        case 0: return 'New Moon';
        case 1: return 'Waxing Crescent';
        case 2: return 'First Quarter';
        case 3: return 'Waxing Gibbous';
        case 4: return 'Full Moon';
        case 5: return 'Waning Gibbous';
        case 6: return 'Last Quarter';
        case 7: return 'Waning Crescent';
        default: return 'Unknown';
    }
};

const getMoonIcon = (phase: string) => {
    switch (phase) {
        case 'New Moon': return '🌑';
        case 'Waxing Crescent': return '🌒';
        case 'First Quarter': return '🌓';
        case 'Waxing Gibbous': return '🌔';
        case 'Full Moon': return '🌕';
        case 'Waning Gibbous': return '🌖';
        case 'Last Quarter': return '🌗';
        case 'Waning Crescent': return '🌘';
        default: return '🌑';
    }
};

const getDayOfYear = (date: Date) => {
    const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
};

const getWeekOfYear = (date: Date) => {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

const getNumerologySum = (date: Date) => {
    // Extract numerical components from UTC to match displayed string
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate();
    const y = date.getUTCFullYear();
    const str = `${m}${d}${y}`;
    let sum = str.split('').reduce((a, b) => a + parseInt(b), 0);
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
        sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
    }
    return sum;
};

// Helper for local YYYY-MM-DD
const getLocalDateString = (d: Date = new Date()) => {
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - (offset * 60 * 1000));
    return local.toISOString().split('T')[0];
};

// --- Component ---

export const DateDiffCalculator: React.FC = () => {
    // Fix: Use local time instead of UTC to avoid "day ahead" errors in evening hours
    const today = getLocalDateString();
    const lastYearDate = new Date();
    lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
    const lastYear = getLocalDateString(lastYearDate);

    const [startDate, setStartDate] = useState(lastYear);
    const [endDate, setEndDate] = useState(today);
    
    const [includeStartDate, setIncludeStartDate] = useState(true);
    const [includeEndDate, setIncludeEndDate] = useState(false);

    const startDateRef = useRef<HTMLInputElement>(null);
    const endDateRef = useRef<HTMLInputElement>(null);

    const handleSwap = () => {
        setStartDate(endDate);
        setEndDate(startDate);
    };

    const d1 = new Date(startDate);
    const d2 = new Date(endDate);

    const isValid = !isNaN(d1.getTime()) && !isNaN(d2.getTime());
    
    const start = d1 < d2 ? d1 : d2;
    const end = d1 < d2 ? d2 : d1;
    const isReversed = d1 > d2;
    
    let totalTimeDiff = Math.abs(d2.getTime() - d1.getTime());
    let totalDays = Math.floor(totalTimeDiff / (1000 * 3600 * 24));
    
    let adjustment = 0;
    if (includeStartDate && includeEndDate) adjustment = 1;
    if (!includeStartDate && !includeEndDate) adjustment = -1;
    
    totalDays = Math.max(0, totalDays + adjustment);

    const calcStart = new Date(start);
    const calcEnd = new Date(end);
    
    if (includeStartDate && includeEndDate) calcEnd.setUTCDate(calcEnd.getUTCDate() + 1);
    if (!includeStartDate && !includeEndDate) calcEnd.setUTCDate(calcEnd.getUTCDate() - 1);

    let years = calcEnd.getUTCFullYear() - calcStart.getUTCFullYear();
    let months = calcEnd.getUTCMonth() - calcStart.getUTCMonth();
    let days = calcEnd.getUTCDate() - calcStart.getUTCDate();

    if (days < 0) {
        months--;
        const prevMonth = new Date(Date.UTC(calcEnd.getUTCFullYear(), calcEnd.getUTCMonth(), 0));
        days += prevMonth.getUTCDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const totalSeconds = totalMinutes * 60;

    const getStats = (date: Date) => ({
        // Use UTC display for components because string-based dates parse to UTC midnight
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
        moonPhase: getMoonPhase(date),
        weekOfYear: getWeekOfYear(date),
        dayOfYear: getDayOfYear(date),
        numerology: getNumerologySum(date)
    });

    const startStats = isValid ? getStats(d1) : null;
    const endStats = isValid ? getStats(d2) : null;

    const timelinePoints = [];
    if (isValid) {
        const step = (d2.getTime() - d1.getTime()) / 4;
        for(let i=0; i<=4; i++) {
            const t = new Date(d1.getTime() + (step * i));
            timelinePoints.push(t);
        }
    }

    const openStartPicker = () => {
        if(startDateRef.current) {
            startDateRef.current.showPicker();
        }
    };

    const openEndPicker = () => {
        if(endDateRef.current) {
            endDateRef.current.showPicker();
        }
    };

    return (
        <div className="bg-[#0c0c0e] border border-white/5 rounded-xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
            
            <div className="text-center mb-10 relative z-10">
                <div className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-2">Duration Analysis</div>
                <h3 className="text-xl md:text-2xl text-zinc-100 font-light">
                    From <span className="text-emerald-400 font-bold">{d1.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</span> to <span className="text-emerald-400 font-bold">{d2.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</span> is
                </h3>
                <div className="mt-4 text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-zinc-400 font-heading">
                    {years > 0 && <span>{years}<span className="text-base text-zinc-500 font-normal ml-1 mr-4">years</span></span>}
                    {months > 0 && <span>{months}<span className="text-base text-zinc-500 font-normal ml-1 mr-4">months</span></span>}
                    {days} <span className="text-base text-zinc-500 font-normal ml-1">days</span>
                </div>
                {isReversed && <div className="text-red-400 text-xs font-mono mt-2">(Dates are reversed)</div>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10 relative z-10">
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div 
                        className="bg-zinc-900/50 border border-white/10 rounded-lg p-1 group focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all cursor-pointer relative"
                        onClick={openStartPicker}
                    >
                        <label className="block text-[10px] text-zinc-500 uppercase tracking-wider pl-3 pt-2 cursor-pointer">Start Date</label>
                        <div className="flex items-center relative">
                            <input 
                                ref={startDateRef}
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-transparent border-none text-zinc-200 text-lg font-mono focus:ring-0 px-3 pb-2 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 z-10"
                                style={{ colorScheme: 'dark' }}
                            />
                            <div className="absolute right-3 pointer-events-none text-zinc-500 group-hover:text-emerald-400 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${includeStartDate ? 'bg-emerald-500 border-emerald-400' : 'bg-transparent border-zinc-600'}`}>
                            {includeStartDate && <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <input type="checkbox" checked={includeStartDate} onChange={(e) => setIncludeStartDate(e.target.checked)} className="hidden" />
                        <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">Include Start Date?</span>
                    </label>

                    {startStats && (
                        <div className="mt-2 space-y-1 text-sm text-zinc-400 font-mono">
                            <div className="flex justify-between border-b border-white/5 pb-1"><span>{startStats.dayOfWeek}</span> <span className="text-zinc-600">Day of Week</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-1"><span className="flex items-center gap-2">{getMoonIcon(startStats.moonPhase)} {startStats.moonPhase}</span> <span className="text-zinc-600">Moon</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-1"><span>{startStats.dayOfYear}</span> <span className="text-zinc-600">Day of Year</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-1"><span>{startStats.weekOfYear}</span> <span className="text-zinc-600">Week of Year</span></div>
                            <div className="flex justify-between"><span className="text-emerald-500 font-bold">{startStats.numerology}</span> <span className="text-zinc-600">Numerology</span></div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 flex flex-col justify-center items-center">
                    <div className="w-full bg-zinc-900/30 border border-white/5 rounded-xl p-4 space-y-3">
                         <div className="flex justify-between items-center text-sm">
                             <span className="text-zinc-500">Years</span>
                             <span className="font-mono text-zinc-200">{years}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                             <span className="text-zinc-500">Months</span>
                             <span className="font-mono text-zinc-200">{(years * 12) + months}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                             <span className="text-zinc-500">Weeks</span>
                             <span className="font-mono text-zinc-200">{totalWeeks.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                             <span className="text-zinc-500">Days</span>
                             <span className="font-mono text-zinc-200">{totalDays.toLocaleString()}</span>
                         </div>
                         <div className="w-full h-px bg-white/10 my-2"></div>
                         <div className="flex justify-between items-center text-xs text-zinc-600">
                             <span>Hours</span>
                             <span className="font-mono">{totalHours.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center text-xs text-zinc-600">
                             <span>Minutes</span>
                             <span className="font-mono">{totalMinutes.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center text-xs text-zinc-600">
                             <span>Seconds</span>
                             <span className="font-mono">{totalSeconds.toLocaleString()}</span>
                         </div>
                    </div>

                    <button 
                        onClick={handleSwap}
                        className="mt-6 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                        Swap Dates
                    </button>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div 
                        className="bg-zinc-900/50 border border-white/10 rounded-lg p-1 group focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all cursor-pointer relative"
                        onClick={openEndPicker}
                    >
                        <label className="block text-[10px] text-zinc-500 uppercase tracking-wider pl-3 pt-2 cursor-pointer">End Date</label>
                        <div className="flex items-center relative">
                            <input 
                                ref={endDateRef}
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-transparent border-none text-zinc-200 text-lg font-mono focus:ring-0 px-3 pb-2 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 z-10"
                                style={{ colorScheme: 'dark' }}
                            />
                            <div className="absolute right-3 pointer-events-none text-zinc-500 group-hover:text-emerald-400 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group">
                         <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${includeEndDate ? 'bg-emerald-500 border-emerald-400' : 'bg-transparent border-zinc-600'}`}>
                            {includeEndDate && <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <input type="checkbox" checked={includeEndDate} onChange={(e) => setIncludeEndDate(e.target.checked)} className="hidden" />
                        <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">Include End Date?</span>
                    </label>

                    {endStats && (
                        <div className="mt-2 space-y-1 text-sm text-zinc-400 font-mono">
                            <div className="flex justify-between border-b border-white/5 pb-1"><span>{endStats.dayOfWeek}</span> <span className="text-zinc-600">Day of Week</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-1"><span className="flex items-center gap-2">{getMoonIcon(endStats.moonPhase)} {endStats.moonPhase}</span> <span className="text-zinc-600">Moon</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-1"><span>{endStats.dayOfYear}</span> <span className="text-zinc-600">Day of Year</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-1"><span>{endStats.weekOfYear}</span> <span className="text-zinc-600">Week of Year</span></div>
                            <div className="flex justify-between"><span className="text-emerald-500 font-bold">{endStats.numerology}</span> <span className="text-zinc-600">Numerology</span></div>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative pt-6 mt-6 border-t border-white/5">
                 <div className="text-center text-[10px] text-zinc-600 uppercase tracking-[0.2em] mb-4">Segments of Time</div>
                 <div className="relative h-1 bg-zinc-800 rounded-full w-full mb-8">
                     <div className="absolute top-0 left-0 h-full bg-emerald-500/50 rounded-full" style={{ width: '100%' }}></div>
                     {timelinePoints.map((point, i) => (
                         <div 
                            key={i} 
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-zinc-900 border-2 border-emerald-500 rounded-full z-10"
                            style={{ left: `${i * 25}%` }}
                         >
                            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-zinc-500 whitespace-nowrap">
                                {point.toLocaleDateString(undefined, {month:'numeric', day:'numeric', year: '2-digit', timeZone: 'UTC'})}
                            </div>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    );
};

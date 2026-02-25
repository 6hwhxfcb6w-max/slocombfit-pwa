import { useState, useEffect, useCallback } from "react";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot, setDoc, serverTimestamp, query, orderBy } from "firebase/firestore";

// ============================================================
// SLOCOMB FITNESS CENTER — PWA v4 (Firebase Edition)
// Auth, Firestore, localStorage prefs, iOS fix, no yoga
// ============================================================

// ============================================================
// SVG ICONS
// ============================================================
const Icons = {
  barbell: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6.5 6.5v11M17.5 6.5v11M2 9v6M22 9v6M4 8v8M20 8v8M6.5 12h11" /></svg>,
  calendar: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
  dumbbell: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 5v14M18 5v14M3 7v10M21 7v10M6 12h12" /></svg>,
  mapPin: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  home: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  bell: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>,
  settings: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
  x: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  edit: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  trash: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>,
  plus: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  phone: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>,
  mail: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
  message: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>,
  user: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  clock: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  send: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
  megaphone: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 11l18-5v12L3 13v-2z" /><path d="M11.6 16.8a3 3 0 11-5.8-1.6" /></svg>,
  trophy: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" /><path d="M18 2H6v7a6 6 0 1012 0V2z" /></svg>,
  target: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
  chevronRight: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="9 18 15 12 9 6" /></svg>,
  sun: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
  moon: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>,
  share: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>,
  flag: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>,
  check: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12" /></svg>,
  instagram: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>,
  facebook: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>,
  upload: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
  lock: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  eye: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  sfcLogo: (p) => (
    <svg viewBox="0 0 100 100" {...p}>
      <circle cx="50" cy="50" r="47" fill="#B91C1C" stroke="#1a1a1a" strokeWidth="3"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#1a1a1a" strokeWidth="2.5"/>
      <text x="50" y="52" textAnchor="middle" dominantBaseline="middle" fontFamily="'Oswald',sans-serif" fontWeight="700" fontSize="28" letterSpacing="2" fill="#1a1a1a">SFC</text>
      <rect x="28" y="64" width="6" height="10" rx="1" fill="#1a1a1a"/><rect x="66" y="64" width="6" height="10" rx="1" fill="#1a1a1a"/>
      <rect x="34" y="66.5" width="32" height="5" rx="1.5" fill="#1a1a1a"/><rect x="24" y="66" width="6" height="6" rx="1" fill="#1a1a1a"/><rect x="70" y="66" width="6" height="6" rx="1" fill="#1a1a1a"/>
    </svg>
  ),
};
const IC = ({icon, size=20, color, style={}}) => { const I = Icons[icon]; return I ? <I width={size} height={size} style={{color:color||"currentColor",flexShrink:0,...style}} /> : null; };

// ============================================================
// DATA & CONSTANTS
// ============================================================
const GYM = {
  name: "Slocomb Fitness Center", short: "SFC", tagline: "Live Local. Lift Local.",
  mission: "Our mission is to empower our community to achieve their health and fitness goals through a welcoming environment, expert guidance, and a supportive community spirit.",
  address: "130 S Dalton Street, Slocomb, AL 36375",
  phone: "(334) 258-4001", email: "slocombfitnesscenter@gmail.com",
  facebook: "https://www.facebook.com/p/Slocomb-Fitness-Center-100089148735561/",
  facebookPage: "https://www.facebook.com/p/Slocomb-Fitness-Center-100089148735561/",
  instagram: "https://www.instagram.com/slocombfitnesscenter/",
  hours: "Open 24/7", dropIn: "$10 per class (Venmo accepted)",
};

// Default data — used to seed Firestore on first run
const DEFAULT_CLASSES = [
  { id:"c1", name:"Flex", days:"Mon, Wed & Fri", time:"5:15 AM", color:"#B91C1C", description:"Build strength, tone muscle and burn calories. Big weights, big results — push your muscles to the limit.", category:"Strength" },
  { id:"c2", name:"HIGH Fitness", days:"Monday", time:"5:45 PM", color:"#D97706", description:"Old school aerobics transformed into a modern, heart-pounding, fun, effective workout. Jump and dance — no weights needed.", category:"Cardio" },
  { id:"c3", name:"Press for Time", days:"Tue & Thu", time:"4:30 PM", color:"#059669", description:"Move at your own pace. Clearly defined intervals — push it to the limit, then rest. Perfect for all levels.", category:"HIIT" },
  { id:"c4", name:"Ultimate Cardio", days:"Tuesday", time:"5:45 PM", color:"#7C3AED", description:"HIIT, body pump, and cardio style workout all rolled into one. High energy, total body burn.", category:"HIIT / Cardio" },
  { id:"c5", name:"Remix", days:"Thursday", time:"5:45 PM", color:"#9333EA", description:"A little bit of everything — cardio, free weights, and body weight exercises to your favorite beats. Total body workout.", category:"Mixed" },
  { id:"c6", name:"Hip Hop", days:"Saturday", time:"8:00 AM", color:"#DB2777", description:"High-energy workout that burns calories and boosts your mood. Latest beats, full-body workout — fun and effective.", category:"Dance" },
];

const DEFAULT_ANNOUNCEMENTS = [
  { id:"a1", title:"Welcome to the SFC App!", body:"Stay up to date with classes, schedules, and gym news — all in one place.", date:"Feb 25, 2026", pinned:true, type:"announcement" },
  { id:"a2", title:"Holiday Hours Reminder", body:"We're open 24/7 as always — even on holidays. The gym never sleeps!", date:"Feb 25, 2026", pinned:false, type:"announcement" },
];

const TRAINER_SPECIALTIES = [
  "Strength Training", "Weight Loss", "Bodybuilding", "Functional Fitness",
  "HIIT / Conditioning", "Flexibility & Mobility", "Sports Performance",
  "Senior Fitness", "Youth Training", "Nutrition Coaching",
  "Powerlifting", "CrossFit Style", "Injury Rehab / Recovery",
  "Group Fitness", "Boxing / Kickboxing", "Prenatal / Postpartum",
];

const DEFAULT_WORKOUTS = {
  "Upper Body": {
    "30": [
      { id:"u30-1", name:"Barbell Bench Press", sets:3, reps:"10" },
      { id:"u30-2", name:"Dumbbell Shoulder Press", sets:3, reps:"12" },
      { id:"u30-3", name:"Cable Lat Pulldown", sets:3, reps:"12" },
      { id:"u30-4", name:"Chest Press Machine", sets:3, reps:"12" },
      { id:"u30-5", name:"Cable Tricep Pushdowns", sets:3, reps:"12" },
      { id:"u30-6", name:"Dumbbell Bicep Curls", sets:3, reps:"12" },
    ],
    "60": [
      { id:"u60-1", name:"Barbell Bench Press", sets:4, reps:"8" },
      { id:"u60-2", name:"Chest Press Machine", sets:3, reps:"12" },
      { id:"u60-3", name:"Barbell Overhead Press", sets:4, reps:"8" },
      { id:"u60-4", name:"Dumbbell Lateral Raises", sets:3, reps:"15" },
      { id:"u60-5", name:"Cable Rows", sets:4, reps:"10" },
      { id:"u60-6", name:"Dumbbell Bent Over Rows", sets:3, reps:"12" },
      { id:"u60-7", name:"Barbell Curls", sets:3, reps:"12" },
      { id:"u60-8", name:"Cable Tricep Pushdowns", sets:3, reps:"12" },
      { id:"u60-9", name:"Dumbbell Hammer Curls", sets:3, reps:"10" },
    ],
  },
  "Lower Body": {
    "30": [
      { id:"l30-1", name:"Barbell Squats", sets:3, reps:"10" },
      { id:"l30-2", name:"Leg Press", sets:3, reps:"12" },
      { id:"l30-3", name:"Dumbbell Lunges", sets:3, reps:"10 each" },
      { id:"l30-4", name:"Leg Extension", sets:3, reps:"12" },
      { id:"l30-5", name:"Leg Curl", sets:3, reps:"12" },
    ],
    "60": [
      { id:"l60-1", name:"Barbell Squats", sets:4, reps:"8" },
      { id:"l60-2", name:"Belt Squat", sets:3, reps:"12" },
      { id:"l60-3", name:"Leg Press", sets:4, reps:"10" },
      { id:"l60-4", name:"Dumbbell Romanian Deadlifts", sets:3, reps:"12" },
      { id:"l60-5", name:"Leg Extension", sets:3, reps:"15" },
      { id:"l60-6", name:"Leg Curl", sets:3, reps:"15" },
      { id:"l60-7", name:"Barbell Hip Thrusts", sets:3, reps:"12" },
      { id:"l60-8", name:"Cable Pull-Throughs", sets:3, reps:"15" },
      { id:"l60-9", name:"Dumbbell Calf Raises", sets:4, reps:"15" },
    ],
  },
  "Full Body": {
    "30": [
      { id:"f30-1", name:"Barbell Squats", sets:3, reps:"8" },
      { id:"f30-2", name:"Barbell Bench Press", sets:3, reps:"8" },
      { id:"f30-3", name:"Cable Rows", sets:3, reps:"10" },
      { id:"f30-4", name:"Dumbbell Shoulder Press", sets:3, reps:"10" },
      { id:"f30-5", name:"Leg Curl", sets:3, reps:"12" },
    ],
    "60": [
      { id:"f60-1", name:"Barbell Squats", sets:4, reps:"8" },
      { id:"f60-2", name:"Barbell Bench Press", sets:4, reps:"8" },
      { id:"f60-3", name:"Cable Lat Pulldown", sets:3, reps:"12" },
      { id:"f60-4", name:"Leg Press", sets:3, reps:"12" },
      { id:"f60-5", name:"Dumbbell Shoulder Press", sets:3, reps:"12" },
      { id:"f60-6", name:"Cable Rows", sets:3, reps:"12" },
      { id:"f60-7", name:"Dumbbell Lunges", sets:3, reps:"10 each" },
      { id:"f60-8", name:"Cable Tricep Pushdowns", sets:3, reps:"12" },
      { id:"f60-9", name:"Barbell Curls", sets:3, reps:"12" },
    ],
  },
};

// ============================================================
// COUNTDOWN UTIL
// ============================================================
function getNextClass(classes) {
  const now = new Date(); const dow = now.getDay(); const curMin = now.getHours()*60+now.getMinutes();
  const sched = [];
  classes.forEach(cls => {
    const parseTime = t => { const m=t.match(/(\d+):(\d+)\s*(AM|PM)/i); if(!m)return null; let h=+m[1];const mn=+m[2];const ap=m[3].toUpperCase(); if(ap==="PM"&&h!==12)h+=12;if(ap==="AM"&&h===12)h=0; return h*60+mn; };
    const dayMap={"mon":1,"tue":2,"wed":3,"thu":4,"fri":5,"sat":6,"sun":0};
    const d=cls.days.toLowerCase(); const mins=parseTime(cls.time);
    if(mins===null)return;
    Object.entries(dayMap).forEach(([a,n])=>{ if(d.includes(a)) sched.push({name:cls.name,day:n,mins}); });
  });
  let closest=null,minDiff=Infinity;
  for(const s of sched){ let dd=s.day-dow;if(dd<0)dd+=7;if(dd===0&&s.mins<=curMin)dd=7;const t=dd*1440+(s.mins-curMin);if(t<minDiff){minDiff=t;closest=s;}}
  if(!closest)return{name:"Check schedule",hours:0,mins:0};
  return{name:closest.name,hours:Math.floor(minDiff/60),mins:minDiff%60};
}
function fmtCd(h,m){ if(h>24)return`${Math.floor(h/24)}d ${h%24}h`; if(h>0)return`${h}h ${m}m`; return`${m}m`; }

// ============================================================
// FONTS
// ============================================================
const fl=document.createElement("link");fl.href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap";fl.rel="stylesheet";document.head.appendChild(fl);

// ============================================================
// LOCAL STORAGE HELPERS
// ============================================================
function loadPref(key, fallback) {
  try { const v = localStorage.getItem(`sfc_${key}`); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function savePref(key, val) {
  try { localStorage.setItem(`sfc_${key}`, JSON.stringify(val)); } catch {}
}

// ============================================================
// THEME CSS GENERATOR (with iOS standalone fix + bigger nav)
// ============================================================
function getCSS(dark) {
  const t = dark ? {
    bg:"#0A0A0C",bg2:"#111114",card:"#18181D",cardH:"#1F1F26",
    white:"#F5F5F5",gray:"#9CA3AF",muted:"#555562",
    border:"rgba(255,255,255,.06)",borderL:"rgba(255,255,255,.1)",
    heroGrad:"linear-gradient(135deg,#1a0a0a 0%,#1c1218 50%,#0f0a14 100%)",
    navBg:"rgba(10,10,12,.92)",hdrBg:"rgba(10,10,12,.88)",
    inputBg:"#0A0A0C",
  } : {
    bg:"#F8F7F4",bg2:"#FFFFFF",card:"#FFFFFF",cardH:"#F3F2EF",
    white:"#1A1A1A",gray:"#6B7280",muted:"#9CA3AF",
    border:"rgba(0,0,0,.08)",borderL:"rgba(0,0,0,.12)",
    heroGrad:"linear-gradient(135deg,#2d1111 0%,#3d1c2e 50%,#1a1030 100%)",
    navBg:"rgba(248,247,244,.92)",hdrBg:"rgba(248,247,244,.88)",
    inputBg:"#F3F2EF",
  };
  return `
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  :root{
    --bg:${t.bg};--bg2:${t.bg2};--card:${t.card};--card-h:${t.cardH};
    --white:${t.white};--gray:${t.gray};--muted:${t.muted};
    --crimson:#B91C1C;--crimson-l:#DC2626;--crimson-glow:rgba(185,28,28,.3);
    --gold:#C9A96E;--gold-m:rgba(201,169,110,.15);
    --border:${t.border};--border-l:${t.borderL};
    --r-sm:10px;--r-md:14px;--r-lg:20px;--r-xl:24px;
    --font-d:'Oswald',sans-serif;--font-b:'Inter',system-ui,sans-serif;
    --safe-t:env(safe-area-inset-top,0px);--safe-b:env(safe-area-inset-bottom,0px);
    --hero-grad:${t.heroGrad};--nav-bg:${t.navBg};--hdr-bg:${t.hdrBg};--input-bg:${t.inputBg};
  }
  body{font-family:var(--font-b);background:var(--bg);color:var(--white);overflow-x:hidden;-webkit-font-smoothing:antialiased}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
  @keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}

  .app{max-width:430px;margin:0 auto;min-height:100vh;background:var(--bg);position:relative;padding-bottom:calc(92px + var(--safe-b))}
  .hdr{position:sticky;top:0;z-index:100;background:var(--hdr-bg);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:calc(10px + var(--safe-t)) 20px 10px;display:flex;align-items:center;justify-content:space-between}
  .hdr-brand{display:flex;align-items:center;gap:10px}
  .hdr-logo{width:38px;height:38px;border-radius:50%;overflow:hidden;flex-shrink:0}
  .hdr-title{font-family:var(--font-d);font-size:18px;font-weight:600;letter-spacing:2px}
  .hdr-actions{display:flex;gap:6px}
  .hdr-btn{width:38px;height:38px;border-radius:10px;background:var(--card);border:1px solid var(--border);color:var(--gray);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s}
  .hdr-btn:hover{background:var(--card-h);color:var(--white)}
  .hdr-btn.notif{position:relative}
  .hdr-btn.notif.has::after{content:'';position:absolute;top:7px;right:7px;width:7px;height:7px;background:var(--crimson);border-radius:50%;border:2px solid var(--bg)}

  .pg{padding:16px 20px;animation:fadeIn .3s ease}
  .sec-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:var(--muted);margin-bottom:10px}
  .sec-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
  .see-all{font-size:12px;color:var(--crimson-l);cursor:pointer;font-weight:600;border:none;background:none}

  .hero{background:var(--hero-grad);border-radius:var(--r-xl);padding:28px 24px;margin-bottom:16px;position:relative;overflow:hidden;border:1px solid var(--border-l);animation:fadeUp .5s ease}
  .hero::before{content:'';position:absolute;top:-60%;right:-40%;width:220px;height:220px;background:radial-gradient(circle,rgba(185,28,28,.12) 0%,transparent 70%);pointer-events:none}
  .hero-tag{font-family:var(--font-d);font-size:34px;letter-spacing:3px;line-height:1;color:#F5F5F5}
  .hero-tag span{color:var(--crimson-l)}
  .hero-sub{font-size:13px;color:#9CA3AF;margin-top:6px;margin-bottom:20px}
  .hero-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
  .hero-s{text-align:center;background:rgba(255,255,255,.06);border-radius:var(--r-md);padding:12px 8px;border:1px solid rgba(255,255,255,.08)}
  .hero-sv{font-family:var(--font-d);font-size:22px;letter-spacing:1px;color:#F5F5F5}
  .hero-sl{font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#777;margin-top:2px}

  .cdown{background:var(--card);border-radius:var(--r-lg);padding:16px 20px;margin-bottom:16px;border:1px solid var(--border);display:flex;align-items:center;gap:14px;cursor:pointer;transition:all .2s;animation:fadeUp .5s ease .1s both}
  .cdown:hover{background:var(--card-h);transform:translateY(-1px)}
  .cdown-t{font-family:var(--font-d);font-size:26px;letter-spacing:1px;color:var(--crimson-l);min-width:75px;text-align:center}
  .cdown-lbl{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted)}
  .cdown-name{font-size:15px;font-weight:700;margin-top:1px}

  .ann{background:var(--card);border-radius:var(--r-md);padding:16px 18px;margin-bottom:8px;border:1px solid var(--border);animation:fadeUp .4s ease both}
  .ann.pin{border-color:rgba(185,28,28,.2);background:${dark ? 'linear-gradient(135deg,var(--card),rgba(185,28,28,.04))' : 'linear-gradient(135deg,var(--card),rgba(185,28,28,.06))'}}
  .ann-title{font-size:15px;font-weight:700;margin-bottom:3px;display:flex;align-items:center;gap:8px}
  .ann-badge{font-size:9px;background:var(--crimson);color:white;padding:2px 7px;border-radius:4px;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
  .ann-body{font-size:13px;color:var(--gray);line-height:1.5}
  .ann-date{font-size:11px;color:var(--muted);margin-top:6px}

  .cls-scroll{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px;margin-bottom:20px;-webkit-overflow-scrolling:touch;scrollbar-width:none;animation:fadeUp .5s ease .15s both}
  .cls-scroll::-webkit-scrollbar{display:none}
  .cls-card{min-width:148px;background:var(--card);border-radius:var(--r-lg);padding:18px 16px;border:1px solid var(--border);cursor:pointer;transition:all .25s;position:relative;overflow:hidden;flex-shrink:0}
  .cls-card:hover{transform:translateY(-2px);border-color:var(--border-l)}
  .cls-card-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:10px}
  .cls-card-name{font-family:var(--font-d);font-size:18px;letter-spacing:1px;margin-bottom:3px}
  .cls-card-time{font-size:12px;color:var(--gray)}
  .cls-card-days{font-size:11px;color:var(--muted);margin-top:2px}

  .modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:300;display:flex;align-items:flex-end;justify-content:center;animation:fadeIn .2s ease}
  .modal-sh{background:var(--bg2);border-radius:var(--r-xl) var(--r-xl) 0 0;width:100%;max-width:430px;max-height:85vh;overflow-y:auto;padding:24px 24px calc(24px + var(--safe-b));animation:slideUp .3s ease}
  .modal-handle{width:36px;height:4px;background:var(--muted);border-radius:2px;margin:0 auto 20px}

  .sch-day{margin-bottom:20px;animation:fadeUp .4s ease both}
  .sch-day-lbl{font-family:var(--font-d);font-size:22px;letter-spacing:2px;margin-bottom:8px}
  .sch-item{display:flex;align-items:center;gap:12px;background:var(--card);border-radius:var(--r-md);padding:12px 14px;margin-bottom:6px;border:1px solid var(--border);cursor:pointer;transition:all .2s}
  .sch-item:hover{background:var(--card-h)}
  .sch-badge{min-width:68px;text-align:center;font-family:var(--font-d);font-size:14px;letter-spacing:.5px;padding:6px 8px;border-radius:8px;color:white}

  .wo-tabs{display:flex;gap:4px;margin-bottom:12px}
  .wo-tab{flex:1;padding:10px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--gray);font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;font-family:var(--font-b);text-align:center}
  .wo-tab.active{background:var(--crimson);color:white;border-color:var(--crimson)}
  .wo-dur{display:flex;gap:6px;margin-bottom:16px}
  .wo-dur-btn{flex:1;padding:10px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--gray);font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;font-family:var(--font-d);letter-spacing:1px;text-align:center}
  .wo-dur-btn.active{background:linear-gradient(135deg,var(--crimson),#991B1B);color:white;border-color:var(--crimson);box-shadow:0 4px 16px var(--crimson-glow)}
  .wo-exercise{display:flex;align-items:center;gap:14px;background:var(--card);border-radius:var(--r-md);padding:14px 16px;margin-bottom:6px;border:1px solid var(--border);animation:fadeUp .3s ease both}
  .wo-num{font-family:var(--font-d);font-size:20px;color:var(--crimson-l);width:28px;text-align:center;flex-shrink:0}
  .wo-name{flex:1;font-weight:600;font-size:14px}
  .wo-sets{font-family:var(--font-d);font-size:14px;color:var(--gray);letter-spacing:.5px;white-space:nowrap}
  .wo-note{margin-top:14px;padding:14px;background:var(--gold-m);border-radius:var(--r-md);font-size:12px;color:var(--gray);line-height:1.5;border:1px solid rgba(201,169,110,.1)}

  .trainer-card{background:var(--card);border-radius:var(--r-lg);padding:18px;border:1px solid var(--border);margin-bottom:10px;display:flex;gap:14px;animation:fadeUp .4s ease both}
  .trainer-photo{width:56px;height:56px;border-radius:14px;overflow:hidden;background:var(--bg);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .trainer-photo img{width:100%;height:100%;object-fit:cover}
  .trainer-name{font-family:var(--font-d);font-size:18px;letter-spacing:1px;margin-bottom:2px}
  .trainer-tags{display:flex;flex-wrap:wrap;gap:3px;margin-bottom:4px}
  .trainer-tag{font-size:9px;padding:3px 8px;border-radius:10px;background:rgba(185,28,28,.08);color:var(--crimson-l);font-weight:600;letter-spacing:.3px}
  .trainer-bio{font-size:13px;color:var(--gray);line-height:1.5}
  .trainer-contact{font-size:12px;color:var(--crimson-l);margin-top:4px}

  .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:12px 20px;border-radius:var(--r-md);font-size:14px;font-weight:700;border:none;cursor:pointer;transition:all .2s;font-family:var(--font-b);width:100%}
  .btn-p{background:var(--crimson);color:white}
  .btn-p:hover{background:#991B1B}
  .btn-s{background:var(--card);color:var(--white);border:1px solid var(--border)}
  .btn-s:hover{background:var(--card-h)}

  .ct-card{background:var(--card);border-radius:var(--r-md);padding:14px 16px;margin-bottom:6px;border:1px solid var(--border)}
  .ct-label{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:3px}
  .ct-val{font-size:14px;font-weight:500}
  .ct-val a{color:var(--crimson-l);text-decoration:none}
  .map-box{background:var(--card);border-radius:var(--r-lg);padding:30px 20px;border:1px solid var(--border);margin-bottom:16px;cursor:pointer;transition:all .2s}
  .map-box:hover{background:var(--card-h)}
  .social-links{display:flex;gap:8px;margin-bottom:16px}
  .social-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;border-radius:var(--r-md);background:var(--card);border:1px solid var(--border);color:var(--white);text-decoration:none;font-size:13px;font-weight:600;transition:all .2s}
  .social-btn:hover{background:var(--card-h)}

  .set-card{background:var(--card);border-radius:var(--r-lg);padding:18px;border:1px solid var(--border);margin-bottom:14px}
  .set-title{font-family:var(--font-d);font-size:16px;letter-spacing:1.5px;margin-bottom:14px;display:flex;align-items:center;gap:8px}
  .set-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)}
  .set-row:last-child{border-bottom:none}
  .set-row-info{flex:1}
  .set-row-label{font-size:14px;font-weight:600}
  .set-row-desc{font-size:12px;color:var(--muted);margin-top:1px}
  .toggle{width:44px;height:26px;border-radius:13px;border:none;padding:2px;cursor:pointer;transition:all .25s;flex-shrink:0}
  .toggle.on{background:var(--crimson)}
  .toggle.off{background:var(--muted)}
  .toggle-thumb{width:22px;height:22px;border-radius:50%;background:white;transition:transform .25s;box-shadow:0 1px 3px rgba(0,0,0,.3)}
  .toggle.on .toggle-thumb{transform:translateX(18px)}

  .install-guide{background:var(--card);border-radius:var(--r-lg);padding:20px;border:1px solid rgba(185,28,28,.15);margin-bottom:20px;position:relative;animation:fadeUp .5s ease .2s both}
  .ig-dismiss{position:absolute;top:12px;right:12px;background:none;border:none;color:var(--muted);cursor:pointer;padding:4px}
  .ig-title{font-family:var(--font-d);font-size:18px;letter-spacing:1.5px;margin-bottom:4px}
  .ig-sub{font-size:12px;color:var(--gray);margin-bottom:14px;line-height:1.4}
  .ig-tabs{display:flex;gap:4px;margin-bottom:14px}
  .ig-tab{flex:1;padding:8px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;font-family:var(--font-b)}
  .ig-tab.on{background:var(--crimson);color:white;border-color:var(--crimson)}
  .ig-step{display:flex;gap:12px;margin-bottom:10px;align-items:flex-start}
  .ig-num{width:26px;height:26px;border-radius:50%;background:var(--crimson);color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
  .ig-step-text{font-size:13px;color:var(--gray);line-height:1.5;padding-top:3px}

  .fb-type{display:flex;gap:4px;margin-bottom:10px}
  .fb-type-btn{flex:1;padding:9px;border-radius:8px;border:1px solid transparent;background:rgba(128,128,128,.06);color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;font-family:var(--font-b);text-align:center}
  .fb-type-btn.on{border-color:var(--crimson);color:var(--crimson-l);background:rgba(185,28,28,.06)}

  .notif-panel{position:fixed;top:0;right:0;width:100%;max-width:430px;height:100vh;background:var(--bg2);z-index:250;animation:slideInRight .3s ease;overflow-y:auto}
  .notif-hdr{display:flex;align-items:center;justify-content:space-between;padding:calc(16px + var(--safe-t)) 20px 16px;border-bottom:1px solid var(--border)}
  .notif-title{font-family:var(--font-d);font-size:22px;letter-spacing:2px}
  .notif-item{display:flex;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border)}
  .notif-item.unread{background:rgba(185,28,28,.04)}
  .notif-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:6px}
  .notif-dot.on{background:var(--crimson)}
  .notif-dot.off{background:var(--muted);opacity:.3}

  .adm{max-width:900px;margin:0 auto;padding:calc(20px + var(--safe-t)) 20px 20px}
  .adm-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--border)}
  .adm-title{font-family:var(--font-d);font-size:26px;letter-spacing:2px}
  .adm-badge{background:linear-gradient(135deg,var(--crimson),var(--gold));color:white;font-size:10px;font-weight:700;padding:4px 10px;border-radius:20px;letter-spacing:.5px}
  .adm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-bottom:20px}
  .adm-stat{background:var(--card);border-radius:var(--r-md);padding:18px;border:1px solid var(--border)}
  .adm-stat-v{font-family:var(--font-d);font-size:32px;letter-spacing:1px}
  .adm-stat-l{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1.5px;margin-top:2px}
  .adm-sec{background:var(--card);border-radius:var(--r-lg);padding:18px;border:1px solid var(--border);margin-bottom:14px}
  .adm-sec-t{font-family:var(--font-d);font-size:18px;letter-spacing:1.5px;margin-bottom:14px;display:flex;align-items:center;gap:8px}
  .adm-inp{width:100%;background:var(--input-bg);border:1px solid var(--border-l);border-radius:var(--r-sm);padding:11px 13px;color:var(--white);font-size:14px;font-family:var(--font-b);margin-bottom:8px;outline:none;transition:border-color .2s}
  .adm-inp:focus{border-color:var(--crimson)}
  .adm-inp::placeholder{color:var(--muted)}
  .adm-ta{width:100%;background:var(--input-bg);border:1px solid var(--border-l);border-radius:var(--r-sm);padding:11px 13px;color:var(--white);font-size:14px;font-family:var(--font-b);margin-bottom:8px;outline:none;resize:vertical;min-height:70px;transition:border-color .2s}
  .adm-ta:focus{border-color:var(--crimson)}
  .adm-row{display:flex;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)}
  .adm-row:last-child{border-bottom:none}
  .adm-row-c{flex:1}
  .adm-row-t{font-weight:600;font-size:14px}
  .adm-row-s{font-size:12px;color:var(--muted)}
  .adm-row-a{display:flex;gap:4px}
  .adm-ib{width:32px;height:32px;border-radius:8px;border:1px solid var(--border);background:var(--input-bg);color:var(--gray);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s}
  .adm-ib:hover{background:var(--card-h);color:var(--white)}
  .adm-ib.del:hover{background:rgba(185,28,28,.1);color:var(--crimson-l)}
  .adm-tabs{display:flex;gap:3px;background:var(--input-bg);border-radius:var(--r-sm);padding:3px;margin-bottom:18px;overflow-x:auto;scrollbar-width:none}
  .adm-tabs::-webkit-scrollbar{display:none}
  .adm-tab{padding:9px 12px;border-radius:7px;border:none;background:transparent;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;font-family:var(--font-b);white-space:nowrap}
  .adm-tab.on{background:var(--card);color:var(--white)}
  .toast{position:fixed;top:calc(16px + var(--safe-t));left:50%;transform:translateX(-50%);background:var(--crimson);color:white;padding:12px 24px;border-radius:var(--r-md);font-weight:700;font-size:13px;z-index:999;animation:fadeUp .3s ease;box-shadow:0 8px 32px rgba(0,0,0,.4)}
  .spec-grid{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px}
  .spec-chip{font-size:11px;padding:6px 10px;border-radius:20px;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:all .2s;font-family:var(--font-b)}
  .spec-chip.on{border-color:var(--crimson);color:var(--crimson-l);background:rgba(185,28,28,.06)}
  .page-title{font-family:var(--font-d);font-size:30px;letter-spacing:2px}
  .page-sub{font-size:13px;color:var(--gray);margin-bottom:16px}
  .gold-line{width:40px;height:2px;background:var(--gold);margin:12px 0;border-radius:1px}

  .bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:var(--nav-bg);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:2px solid var(--border-l);display:flex;justify-content:space-around;padding:10px 4px calc(12px + var(--safe-b));z-index:200;box-shadow:0 -4px 20px rgba(0,0,0,.15)}
  .nav-i{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 12px;border-radius:14px;cursor:pointer;transition:all .2s;border:none;background:none;min-width:56px}
  .nav-i-ic{color:var(--gray);transition:all .2s}
  .nav-i-lb{font-size:11px;font-weight:700;color:var(--gray);letter-spacing:.5px;transition:all .2s}
  .nav-i.on .nav-i-ic{color:var(--crimson-l)}
  .nav-i.on .nav-i-lb{color:var(--crimson-l)}
  .nav-i.on{background:rgba(185,28,28,.12)}

  .login-wrap{max-width:400px;margin:0 auto;padding:60px 24px;min-height:100vh;display:flex;flex-direction:column;justify-content:center}
  .login-logo{width:80px;height:80px;margin:0 auto 20px}
  .login-title{font-family:var(--font-d);font-size:28px;letter-spacing:2px;text-align:center;margin-bottom:4px}
  .login-sub{font-size:13px;color:var(--gray);text-align:center;margin-bottom:30px}
  .login-err{background:rgba(185,28,28,.1);border:1px solid rgba(185,28,28,.2);border-radius:var(--r-sm);padding:10px 14px;font-size:13px;color:var(--crimson-l);margin-bottom:12px;text-align:center}
  .login-inp{width:100%;background:var(--card);border:1px solid var(--border-l);border-radius:var(--r-md);padding:14px 16px;color:var(--white);font-size:15px;font-family:var(--font-b);margin-bottom:10px;outline:none;transition:border-color .2s}
  .login-inp:focus{border-color:var(--crimson)}
  .login-inp::placeholder{color:var(--muted)}
  .spinner{width:20px;height:20px;border:2px solid rgba(255,255,255,.3);border-top-color:white;border-radius:50%;animation:spin .6s linear infinite;display:inline-block}
  `;
}
// ============================================================
// TOGGLE
// ============================================================
function Toggle({on, onChange}) {
  return <button className={`toggle ${on?"on":"off"}`} onClick={()=>onChange(!on)}><div className="toggle-thumb"/></button>;
}

// ============================================================
// NOTIFICATION PANEL
// ============================================================
function NotifPanel({notifs,onClose}) {
  return <div className="notif-panel" style={{left:"50%",transform:"translateX(-50%)"}}>
    <div className="notif-hdr"><div className="notif-title">NOTIFICATIONS</div><button className="hdr-btn" onClick={onClose}><IC icon="x" size={18}/></button></div>
    {notifs.length===0 ? <div style={{padding:40,textAlign:"center",color:"var(--muted)",fontSize:13}}>No notifications yet</div>
    : notifs.map(n=><div key={n.id} className={`notif-item ${!n.read?"unread":""}`}>
      <div className={`notif-dot ${n.read?"off":"on"}`}/><div style={{flex:1}}>
      <div style={{fontWeight:700,fontSize:14,marginBottom:2}}>{n.title}</div>
      <div style={{fontSize:13,color:"var(--gray)",lineHeight:1.4}}>{n.body}</div>
      <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>{n.time}</div></div></div>)}
  </div>;
}

// ============================================================
// CLASS MODAL
// ============================================================
function ClassModal({cls,onClose}) {
  if(!cls)return null;
  return <div className="modal-ov" onClick={onClose}><div className="modal-sh" onClick={e=>e.stopPropagation()}>
    <div className="modal-handle"/>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
      <div style={{width:48,height:48,borderRadius:12,background:cls.color,display:"flex",alignItems:"center",justifyContent:"center"}}><IC icon="barbell" size={24} color="white"/></div>
      <div><div style={{fontFamily:"var(--font-d)",fontSize:30,letterSpacing:2}}>{cls.name.toUpperCase()}</div>
      <div style={{fontSize:13,color:"var(--crimson-l)",fontWeight:600}}>{cls.days} · {cls.time}</div></div></div>
    <div style={{display:"inline-block",fontSize:10,textTransform:"uppercase",letterSpacing:1.5,color:"var(--muted)",background:"rgba(128,128,128,.1)",padding:"4px 10px",borderRadius:20,marginBottom:14}}>{cls.category}</div>
    <div style={{fontSize:14,lineHeight:1.7,color:"var(--gray)",marginBottom:20}}>{cls.description}</div>
    <div style={{background:"rgba(128,128,128,.06)",borderRadius:10,padding:"12px 14px",fontSize:12,color:"var(--muted)",marginBottom:16}}>All classes included with membership. Drop-in guests: {GYM.dropIn}</div>
    <button className="btn btn-s" onClick={onClose}>Close</button>
  </div></div>;
}

// ============================================================
// INSTALL GUIDE (idiot-proof version)
// ============================================================
function InstallGuide({onDismiss}) {
  const [platform, setPlatform] = useState("iphone");
  return <div className="install-guide">
    <button className="ig-dismiss" onClick={onDismiss}><IC icon="x" size={14}/></button>
    <div className="ig-title">WANT THIS AS AN APP?</div>
    <div className="ig-sub">You can add SFC to your phone's home screen — it'll look and work like a real app. Takes 30 seconds.</div>
    <div className="ig-tabs">
      <button className={`ig-tab ${platform==="iphone"?"on":""}`} onClick={()=>setPlatform("iphone")}>iPhone</button>
      <button className={`ig-tab ${platform==="android"?"on":""}`} onClick={()=>setPlatform("android")}>Android</button>
    </div>
    {platform==="iphone" ? <>
      <div className="ig-step"><div className="ig-num">1</div><div className="ig-step-text">Look at the <strong>very bottom of your screen</strong> in Safari. You'll see a row of icons. Tap the <strong>Share button</strong> — it's the square with an arrow pointing up ↑</div></div>
      <div className="ig-step"><div className="ig-num">2</div><div className="ig-step-text">A menu will slide up. <strong>Scroll down</strong> in that menu until you see <strong>"Add to Home Screen"</strong> — it has a + icon. Tap it.</div></div>
      <div className="ig-step"><div className="ig-num">3</div><div className="ig-step-text">Tap <strong>"Add"</strong> in the top right corner. Done! You'll see the SFC icon on your home screen. <strong>Open it from there</strong> for the best experience.</div></div>
      <div style={{fontSize:11,color:"var(--muted)",marginTop:8,lineHeight:1.5,background:"rgba(128,128,128,.06)",padding:"8px 10px",borderRadius:8}}>
        <strong>Important:</strong> You MUST use Safari for this. It won't work in Chrome or other browsers on iPhone. Your iPhone needs to be on iOS 16.4 or newer (most are).
      </div>
    </> : <>
      <div className="ig-step"><div className="ig-num">1</div><div className="ig-step-text">Tap the <strong>three dots ⋮</strong> in the top-right corner of Chrome (or your browser's menu button)</div></div>
      <div className="ig-step"><div className="ig-num">2</div><div className="ig-step-text">Look for <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong> in the menu. Tap it.</div></div>
      <div className="ig-step"><div className="ig-num">3</div><div className="ig-step-text">Tap <strong>"Install"</strong> or <strong>"Add"</strong>. That's it! The SFC app icon will appear on your home screen.</div></div>
      <div style={{fontSize:11,color:"var(--muted)",marginTop:8,lineHeight:1.5}}>
        Most Android phones will also show an "Install" banner at the bottom of the screen automatically.
      </div>
    </>}
  </div>;
}

// ============================================================
// PAGES
// ============================================================
function HomePage({setPage, setSelectedClass, announcements, classes, showInstall, onDismissInstall}) {
  const [next,setNext]=useState(getNextClass(classes));
  useEffect(()=>{const i=setInterval(()=>setNext(getNextClass(classes)),60000);return()=>clearInterval(i);},[classes]);
  const classIcons=["barbell","dumbbell","clock","target","trophy","barbell"];
  return <div className="pg">
    <div className="hero">
      <div className="hero-tag">LIVE LOCAL. <span>LIFT LOCAL.</span></div>
      <div className="hero-sub">Open 24/7 · 130 S Dalton St, Slocomb</div>
      <div className="hero-stats">
        <div className="hero-s"><div className="hero-sv">{classes.length}</div><div className="hero-sl">Classes</div></div>
        <div className="hero-s"><div className="hero-sv">24/7</div><div className="hero-sl">Access</div></div>
        <div className="hero-s"><div className="hero-sv">$10</div><div className="hero-sl">Drop-in</div></div>
      </div>
    </div>

    <div className="cdown" onClick={()=>setPage("schedule")}>
      <div className="cdown-t">{fmtCd(next.hours,next.mins)}</div>
      <div style={{flex:1}}><div className="cdown-lbl">Next Class</div><div className="cdown-name">{next.name}</div></div>
      <IC icon="chevronRight" size={18} color="var(--muted)"/>
    </div>

    <div className="sec-hdr"><div className="sec-label">Announcements</div></div>
    {announcements.length===0 ? <div style={{padding:16,textAlign:"center",color:"var(--muted)",fontSize:13}}>No announcements</div>
    : announcements.map((a,i)=><div key={a.id} className={`ann ${a.pinned?"pin":""}`} style={{animationDelay:`${i*.06}s`}}>
      <div className="ann-title">{a.title}{a.pinned&&<span className="ann-badge">Pinned</span>}</div>
      <div className="ann-body">{a.body}</div><div className="ann-date">{a.date}</div>
    </div>)}

    <div style={{height:8}}/>
    <div className="sec-hdr"><div className="sec-label">Classes</div><button className="see-all" onClick={()=>setPage("schedule")}>Full Schedule →</button></div>
    <div className="cls-scroll">
      {classes.map((cls,i)=><div key={cls.id} className="cls-card" onClick={()=>setSelectedClass(cls)}>
        <div style={{position:"absolute",top:0,left:0,width:"100%",height:3,background:cls.color}}/>
        <div className="cls-card-icon" style={{background:`${cls.color}20`}}><IC icon={classIcons[i%classIcons.length]} size={20} color={cls.color}/></div>
        <div className="cls-card-name">{cls.name.toUpperCase()}</div><div className="cls-card-time">{cls.time}</div><div className="cls-card-days">{cls.days}</div>
      </div>)}
    </div>

    {showInstall && <InstallGuide onDismiss={onDismissInstall}/>}
  </div>;
}

function SchedulePage({setSelectedClass, classes}) {
  const dayOrder=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const dayMap={"Monday":["mon"],"Tuesday":["tue"],"Wednesday":["wed"],"Thursday":["thu"],"Friday":["fri"],"Saturday":["sat"],"Sunday":["sun"]};
  const schedule=dayOrder.map(dayName=>{
    const abbrs=dayMap[dayName]; const dayClasses=[];
    classes.forEach(cls=>{const d=cls.days.toLowerCase();if(abbrs.some(a=>d.includes(a)))dayClasses.push({...cls,displayTime:cls.time});});
    return{name:dayName,classes:dayClasses};
  });
  return <div className="pg">
    <div className="page-title">CLASS SCHEDULE</div><div className="page-sub">Tap any class for details</div>
    {schedule.map((day,di)=><div key={day.name} className="sch-day" style={{animationDelay:`${di*.04}s`}}>
      <div className="sch-day-lbl">{day.name.toUpperCase()}</div>
      {day.classes.length===0 ? <div style={{padding:"10px 14px",color:"var(--muted)",fontSize:13,fontStyle:"italic"}}>No classes</div>
      : day.classes.map((cls,ci)=><div key={`${cls.id}-${ci}`} className="sch-item" onClick={()=>setSelectedClass(cls)}>
        <div className="sch-badge" style={{background:cls.color}}>{cls.displayTime}</div>
        <div><div style={{fontWeight:600,fontSize:14}}>{cls.name}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>{cls.category}</div></div>
        <IC icon="chevronRight" size={16} color="var(--muted)" style={{marginLeft:"auto"}}/>
      </div>)}
    </div>)}
  </div>;
}

function WorkoutsPage({workouts}) {
  const cats=Object.keys(workouts);
  const [cat,setCat]=useState(cats[0]||"Upper Body"); const [dur,setDur]=useState("30");
  const exs=workouts[cat]?.[dur]||[];
  return <div className="pg">
    <div className="page-title">WORKOUTS</div><div className="page-sub">Quick routines using SFC equipment</div>
    <div className="wo-tabs">{cats.map(c=><button key={c} className={`wo-tab ${cat===c?"active":""}`} onClick={()=>setCat(c)}>{c}</button>)}</div>
    <div className="wo-dur">
      <button className={`wo-dur-btn ${dur==="30"?"active":""}`} onClick={()=>setDur("30")}>30 MIN</button>
      <button className={`wo-dur-btn ${dur==="60"?"active":""}`} onClick={()=>setDur("60")}>60 MIN</button>
    </div>
    <div className="sec-label" style={{marginBottom:8}}>{cat} · {dur} min · {exs.length} exercises</div>
    {exs.map((ex,i)=><div key={ex.id} className="wo-exercise" style={{animationDelay:`${i*.04}s`}}>
      <div className="wo-num">{i+1}</div><div className="wo-name">{ex.name}</div><div className="wo-sets">{ex.sets} × {ex.reps}</div>
    </div>)}
    <div className="wo-note">These routines are designed as quick guides using SFC equipment. For personalized programming and coaching, ask about our personal training options.</div>
  </div>;
}

function TrainersPage({trainers}) {
  return <div className="pg">
    <div className="page-title">TRAINERS</div><div className="page-sub">Meet our team</div>
    {trainers.length===0 ? <div style={{textAlign:"center",padding:"40px 20px",color:"var(--muted)"}}>
      <IC icon="user" size={40} color="var(--muted)" style={{marginBottom:12}}/>
      <div style={{fontSize:15,fontWeight:600,marginBottom:4,color:"var(--gray)"}}>Coming Soon</div>
      <div style={{fontSize:13}}>Personal trainer profiles will be listed here.</div>
    </div>
    : trainers.map((t,i)=><div key={t.id} className="trainer-card" style={{animationDelay:`${i*.08}s`}}>
      <div className="trainer-photo">{t.photo ? <img src={t.photo} alt={t.name}/> : <IC icon="user" size={28} color="var(--muted)"/>}</div>
      <div style={{flex:1}}>
        <div className="trainer-name">{t.name.toUpperCase()}</div>
        {t.specialties?.length>0 && <div className="trainer-tags">{t.specialties.map(s=><span key={s} className="trainer-tag">{s}</span>)}</div>}
        <div className="trainer-bio">{t.bio}</div>
        {t.contact && <div className="trainer-contact">{t.contact}</div>}
      </div>
    </div>)}
  </div>;
}

function ContactPage() {
  const mapUrl=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(GYM.address)}`;
  return <div className="pg">
    <div className="page-title">CONTACT</div><div className="page-sub">We'd love to hear from you</div>
    <div className="map-box" onClick={()=>window.open(mapUrl,"_blank")}>
      <div style={{textAlign:"center"}}><IC icon="mapPin" size={36} color="var(--crimson-l)"/>
      <div style={{fontSize:14,fontWeight:600,marginTop:8}}>{GYM.address}</div>
      <div style={{fontSize:12,color:"var(--muted)",marginTop:4}}>Tap to open in Maps</div></div>
    </div>
    <div className="ct-card"><div className="ct-label">Address</div><div className="ct-val">{GYM.address}</div></div>
    <div className="ct-card"><div className="ct-label">Hours</div><div className="ct-val">{GYM.hours}</div></div>
    <div className="ct-card"><div className="ct-label">Phone</div><div className="ct-val"><a href={`tel:${GYM.phone}`}>{GYM.phone}</a></div></div>
    <div className="ct-card"><div className="ct-label">Email</div><div className="ct-val"><a href={`mailto:${GYM.email}`}>{GYM.email}</a></div></div>
    <div style={{display:"flex",gap:8,marginTop:10}}>
      <a href={`tel:${GYM.phone}`} className="btn btn-p" style={{flex:1,textDecoration:"none",textAlign:"center"}}><IC icon="phone" size={16} color="white"/> Call</a>
      <a href={GYM.facebook} target="_blank" rel="noopener" className="btn btn-s" style={{flex:1,textDecoration:"none",textAlign:"center"}}><IC icon="message" size={16}/> Facebook</a>
    </div>
    <div style={{marginTop:16}}><div className="sec-label">Follow Us</div></div>
    <div className="social-links">
      <a href={GYM.facebookPage} target="_blank" rel="noopener" className="social-btn"><IC icon="facebook" size={18}/> Facebook</a>
      <a href={GYM.instagram} target="_blank" rel="noopener" className="social-btn"><IC icon="instagram" size={18}/> Instagram</a>
    </div>
    <div className="gold-line"/>
    <div className="sec-label">About Us</div>
    <div style={{fontSize:14,lineHeight:1.7,color:"var(--gray)"}}>{GYM.mission}</div>
  </div>;
}

function SettingsPage({dark, setDark, notifPrefs, setNotifPrefs}) {
  return <div className="pg">
    <div className="page-title">SETTINGS</div><div className="page-sub">Customize your experience</div>
    <div className="set-card">
      <div className="set-title"><IC icon={dark?"moon":"sun"} size={18}/> APPEARANCE</div>
      <div className="set-row">
        <div className="set-row-info"><div className="set-row-label">Dark Mode</div><div className="set-row-desc">Switch between light and dark themes</div></div>
        <Toggle on={dark} onChange={setDark}/>
      </div>
    </div>
    <div className="set-card">
      <div className="set-title"><IC icon="bell" size={18}/> NOTIFICATIONS</div>
      <div className="set-row">
        <div className="set-row-info"><div className="set-row-label">All Notifications</div><div className="set-row-desc">Master switch for all push notifications</div></div>
        <Toggle on={notifPrefs.all} onChange={v=>setNotifPrefs({...notifPrefs, all:v, announcements: v ? notifPrefs.announcements : false, classes: v ? notifPrefs.classes : false})}/>
      </div>
      <div className="set-row" style={{opacity:notifPrefs.all?1:.4,pointerEvents:notifPrefs.all?"auto":"none"}}>
        <div className="set-row-info"><div className="set-row-label">Announcements</div><div className="set-row-desc">Gym news, closures, and events</div></div>
        <Toggle on={notifPrefs.announcements} onChange={v=>setNotifPrefs({...notifPrefs, announcements:v})}/>
      </div>
      <div className="set-row" style={{opacity:notifPrefs.all?1:.4,pointerEvents:notifPrefs.all?"auto":"none"}}>
        <div className="set-row-info"><div className="set-row-label">Class Updates</div><div className="set-row-desc">Cancellations and schedule changes</div></div>
        <Toggle on={notifPrefs.classes} onChange={v=>setNotifPrefs({...notifPrefs, classes:v})}/>
      </div>
    </div>
    <FeedbackSection/>
  </div>;
}

// ============================================================
// FEEDBACK (saves to Firestore)
// ============================================================
function FeedbackSection() {
  const [type,setType]=useState("feedback");
  const [msg,setMsg]=useState("");
  const [sent,setSent]=useState(false);
  const submit=async()=>{
    if(!msg.trim())return;
    try {
      await addDoc(collection(db, "feedback"), { type, message: msg.trim(), createdAt: serverTimestamp() });
    } catch(e) { console.error("Feedback save error:", e); }
    setSent(true); setMsg(""); setTimeout(()=>setSent(false),3000);
  };
  return <div className="set-card">
    <div className="set-title"><IC icon="flag" size={18}/> FEEDBACK & ISSUES</div>
    <div style={{fontSize:13,color:"var(--gray)",marginBottom:12}}>Let us know how we can improve or report a problem.</div>
    <div className="fb-type">
      <button className={`fb-type-btn ${type==="feedback"?"on":""}`} onClick={()=>setType("feedback")}>Feedback</button>
      <button className={`fb-type-btn ${type==="issue"?"on":""}`} onClick={()=>setType("issue")}>Report Issue</button>
      <button className={`fb-type-btn ${type==="suggestion"?"on":""}`} onClick={()=>setType("suggestion")}>Suggestion</button>
    </div>
    <textarea className="adm-ta" placeholder={type==="issue"?"Describe the issue...":"Share your thoughts..."} value={msg} onChange={e=>setMsg(e.target.value)} style={{background:"var(--input-bg)"}}/>
    {sent ? <div style={{textAlign:"center",padding:12,color:"var(--crimson-l)",fontWeight:700,fontSize:14}}>
      <IC icon="check" size={20} color="var(--crimson-l)" style={{marginBottom:4}}/><br/>Sent! Thank you for your feedback.
    </div> : <button className="btn btn-p" onClick={submit}><IC icon="send" size={14} color="white"/> Submit</button>}
  </div>;
}
// ============================================================
// ADMIN LOGIN
// ============================================================
function AdminLogin({onLogin, onBack}) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if(!email || !pass) { setError("Enter your email and password."); return; }
    setLoading(true); setError("");
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      onLogin();
    } catch(e) {
      if(e.code==="auth/user-not-found"||e.code==="auth/invalid-credential") setError("Invalid email or password. Only approved staff can log in.");
      else if(e.code==="auth/too-many-requests") setError("Too many attempts. Wait a few minutes and try again.");
      else setError("Login failed. Check your credentials.");
    }
    setLoading(false);
  };

  return <div className="login-wrap">
    <div className="login-logo"><Icons.sfcLogo width={80} height={80}/></div>
    <div className="login-title">STAFF LOGIN</div>
    <div className="login-sub">Admin access for authorized staff only</div>
    {error && <div className="login-err">{error}</div>}
    <input className="login-inp" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/>
    <div style={{position:"relative"}}>
      <input className="login-inp" type={showPass?"text":"password"} placeholder="Password" value={pass}
        onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} autoComplete="current-password"/>
      <button onClick={()=>setShowPass(!showPass)} style={{position:"absolute",right:12,top:12,background:"none",border:"none",color:"var(--muted)",cursor:"pointer"}}>
        <IC icon={showPass?"eyeOff":"eye"} size={18}/></button>
    </div>
    <button className="btn btn-p" onClick={handleLogin} disabled={loading} style={{marginTop:4}}>
      {loading ? <span className="spinner"/> : <><IC icon="lock" size={16} color="white"/> Sign In</>}
    </button>
    <button onClick={onBack} style={{marginTop:16,background:"none",border:"none",color:"var(--gray)",fontSize:13,cursor:"pointer",textAlign:"center",width:"100%"}}>← Back to App</button>
  </div>;
}

// ============================================================
// ADMIN PANEL (Firebase-powered)
// ============================================================
function AdminPanel({onExit, classes, setClasses, announcements, setAnnouncements, workouts, setWorkouts, trainers, setTrainers, feedback}) {
  const [tab,setTab]=useState("dashboard");
  const [toast,setToast]=useState(null);
  const [editingClass,setEditingClass]=useState(null);
  const [newClass,setNewClass]=useState({name:"",days:"",time:"",color:"#B91C1C",description:"",category:""});
  const [newAnn,setNewAnn]=useState({title:"",body:"",pinned:false,type:"announcement"});
  const [notifForm,setNotifForm]=useState({title:"",body:"",category:"all"});
  const [woCategory,setWoCategory]=useState("Upper Body");
  const [woDuration,setWoDuration]=useState("30");
  const [newExercise,setNewExercise]=useState({name:"",sets:3,reps:"10"});
  const [newTrainer,setNewTrainer]=useState({name:"",bio:"",contact:"",photo:null,specialties:[]});

  const flash=(msg)=>{setToast(msg);setTimeout(()=>setToast(null),2500);};

  // Firestore CRUD helpers
  const saveClass = async (cls) => {
    try { await setDoc(doc(db, "classes", cls.id), cls); } catch(e) { console.error(e); }
  };
  const deleteClass = async (id) => {
    try { await deleteDoc(doc(db, "classes", id)); } catch(e) { console.error(e); }
  };
  const saveAnnouncement = async (ann) => {
    try { await setDoc(doc(db, "announcements", ann.id), ann); } catch(e) { console.error(e); }
  };
  const deleteAnnouncement = async (id) => {
    try { await deleteDoc(doc(db, "announcements", id)); } catch(e) { console.error(e); }
  };
  const saveTrainer = async (t) => {
    try { await setDoc(doc(db, "trainers", String(t.id)), t); } catch(e) { console.error(e); }
  };
  const deleteTrainer = async (id) => {
    try { await deleteDoc(doc(db, "trainers", String(id))); } catch(e) { console.error(e); }
  };
  const saveWorkouts = async (wo) => {
    try { await setDoc(doc(db, "config", "workouts"), { data: JSON.stringify(wo) }); } catch(e) { console.error(e); }
  };

  const handleLogout = async () => { await signOut(auth); onExit(); };

  const toggleSpec=(spec)=>{
    setNewTrainer(prev=>{
      const has=prev.specialties.includes(spec);
      return{...prev, specialties:has?prev.specialties.filter(s=>s!==spec):[...prev.specialties,spec]};
    });
  };

  const tabs=[
    {id:"dashboard",label:"Dashboard"},{id:"announcements",label:"Announce"},
    {id:"notifications",label:"Push"},{id:"classes",label:"Classes"},
    {id:"workouts",label:"Workouts"},{id:"trainers",label:"Trainers"},
    {id:"feedback",label:"Feedback"},
  ];

  return <div className="adm" style={{animation:"fadeIn .3s ease"}}>
    {toast&&<div className="toast">{toast}</div>}
    <div className="adm-hdr">
      <div><div className="adm-title">SFC ADMIN</div><div style={{fontSize:11,color:"var(--muted)"}}>Manage your gym app</div></div>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <div className="adm-badge">STAFF</div>
        <button className="adm-ib" onClick={handleLogout} title="Logout"><IC icon="lock" size={14}/></button>
        <button className="adm-ib" onClick={onExit}><IC icon="x" size={16}/></button>
      </div>
    </div>
    <div className="adm-tabs">{tabs.map(t=><button key={t.id} className={`adm-tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>)}</div>

    {tab==="dashboard"&&<>
      <div className="adm-grid">
        <div className="adm-stat"><div className="adm-stat-v" style={{color:"var(--crimson-l)"}}>{classes.length}</div><div className="adm-stat-l">Active Classes</div></div>
        <div className="adm-stat"><div className="adm-stat-v" style={{color:"var(--gold)"}}>{announcements.length}</div><div className="adm-stat-l">Announcements</div></div>
        <div className="adm-stat"><div className="adm-stat-v" style={{color:"var(--gray)"}}>{feedback.length}</div><div className="adm-stat-l">Feedback</div></div>
      </div>
      <div className="adm-sec"><div className="adm-sec-t"><IC icon="target" size={18}/> QUICK ACTIONS</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <button className="btn btn-s" onClick={()=>setTab("notifications")}><IC icon="send" size={14}/> Send Push</button>
          <button className="btn btn-s" onClick={()=>setTab("announcements")}><IC icon="megaphone" size={14}/> Announce</button>
          <button className="btn btn-s" onClick={()=>setTab("classes")}><IC icon="edit" size={14}/> Edit Classes</button>
          <button className="btn btn-s" onClick={()=>setTab("workouts")}><IC icon="dumbbell" size={14}/> Workouts</button>
        </div>
      </div>
    </>}

    {tab==="announcements"&&<div className="adm-sec">
      <div className="adm-sec-t"><IC icon="megaphone" size={18}/> POST ANNOUNCEMENT</div>
      <input className="adm-inp" placeholder="Title" value={newAnn.title} onChange={e=>setNewAnn({...newAnn,title:e.target.value})}/>
      <textarea className="adm-ta" placeholder="Message..." value={newAnn.body} onChange={e=>setNewAnn({...newAnn,body:e.target.value})}/>
      <label style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,fontSize:13,color:"var(--gray)",cursor:"pointer"}}>
        <input type="checkbox" checked={newAnn.pinned} onChange={e=>setNewAnn({...newAnn,pinned:e.target.checked})}/> Pin to top</label>
      <button className="btn btn-p" onClick={async()=>{
        if(!newAnn.title)return;
        const id=`a${Date.now()}`;
        const today=new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
        const ann={...newAnn,id,date:today};
        setAnnouncements(p=>[ann,...p]);
        await saveAnnouncement(ann);
        setNewAnn({title:"",body:"",pinned:false,type:"announcement"});flash("Announcement posted");
      }}>Post Announcement</button>
      <div style={{marginTop:20}}><div style={{fontSize:12,fontWeight:700,color:"var(--muted)",marginBottom:10}}>EXISTING</div>
        {announcements.map(a=><div key={a.id} className="adm-row"><div className="adm-row-c"><div className="adm-row-t">{a.title}</div><div className="adm-row-s">{a.date}</div></div>
          <button className="adm-ib del" onClick={async()=>{setAnnouncements(p=>p.filter(x=>x.id!==a.id));await deleteAnnouncement(a.id);flash("Removed");}}><IC icon="trash" size={14}/></button></div>)}
      </div>
    </div>}

    {tab==="notifications"&&<div className="adm-sec">
      <div className="adm-sec-t"><IC icon="send" size={18}/> SEND PUSH NOTIFICATION</div>
      <div style={{fontSize:13,color:"var(--gray)",marginBottom:14}}>Goes to members based on their notification preferences.</div>
      <input className="adm-inp" placeholder="Notification title" value={notifForm.title} onChange={e=>setNotifForm({...notifForm,title:e.target.value})}/>
      <textarea className="adm-ta" placeholder="Message..." value={notifForm.body} onChange={e=>setNotifForm({...notifForm,body:e.target.value})}/>
      <div style={{marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:700,color:"var(--muted)",marginBottom:6}}>SEND TO</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {["all","announcements","classes"].map(c=><button key={c} className={`fb-type-btn ${notifForm.category===c?"on":""}`}
            onClick={()=>setNotifForm({...notifForm,category:c})} style={{textTransform:"capitalize"}}>{c==="all"?"All Members":c==="announcements"?"Announcement Subs":"Class Update Subs"}</button>)}
        </div>
      </div>
      <button className="btn btn-p" onClick={()=>{flash("Push notification sent!");setNotifForm({title:"",body:"",category:"all"});}}>
        <IC icon="send" size={14} color="white"/> Send Notification</button>
      <div style={{marginTop:16,padding:12,background:"var(--gold-m)",borderRadius:10,border:"1px solid rgba(201,169,110,.15)"}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--gold)",marginBottom:3}}>DELIVERY NOTE</div>
        <div style={{fontSize:12,color:"var(--gray)",lineHeight:1.5}}>Android: instant. iPhone: works when app is on home screen (iOS 16.4+). Back up important announcements with Facebook posts.</div>
      </div>
    </div>}

    {tab==="classes"&&<div className="adm-sec">
      <div className="adm-sec-t"><IC icon="calendar" size={18}/> CLASS SCHEDULE</div>
      {editingClass ? <div style={{background:"var(--input-bg)",borderRadius:12,padding:16,marginBottom:12,border:"1px solid var(--crimson)"}}>
        <div style={{fontSize:12,fontWeight:700,color:"var(--crimson-l)",marginBottom:10}}>EDITING: {editingClass.name}</div>
        <input className="adm-inp" placeholder="Class name" value={editingClass.name} onChange={e=>setEditingClass({...editingClass,name:e.target.value})}/>
        <input className="adm-inp" placeholder="Days (e.g. Mon & Wed)" value={editingClass.days} onChange={e=>setEditingClass({...editingClass,days:e.target.value})}/>
        <input className="adm-inp" placeholder="Time (e.g. 5:15 AM)" value={editingClass.time} onChange={e=>setEditingClass({...editingClass,time:e.target.value})}/>
        <input className="adm-inp" placeholder="Category" value={editingClass.category} onChange={e=>setEditingClass({...editingClass,category:e.target.value})}/>
        <textarea className="adm-ta" placeholder="Description..." value={editingClass.description} onChange={e=>setEditingClass({...editingClass,description:e.target.value})}/>
        <div style={{display:"flex",gap:8}}><button className="btn btn-p" style={{flex:1}} onClick={async()=>{
          setClasses(p=>p.map(c=>c.id===editingClass.id?{...editingClass}:c));
          await saveClass(editingClass);
          setEditingClass(null);flash("Class updated");
        }}>Save</button>
        <button className="btn btn-s" style={{flex:1}} onClick={()=>setEditingClass(null)}>Cancel</button></div>
      </div> : <>
        {classes.map(cls=><div key={cls.id} className="adm-row">
          <div style={{width:6,height:36,borderRadius:3,background:cls.color,flexShrink:0}}/>
          <div className="adm-row-c"><div className="adm-row-t">{cls.name}</div><div className="adm-row-s">{cls.days} · {cls.time}</div></div>
          <div className="adm-row-a"><button className="adm-ib" onClick={()=>setEditingClass({...cls})}><IC icon="edit" size={14}/></button>
          <button className="adm-ib del" onClick={async()=>{setClasses(p=>p.filter(c=>c.id!==cls.id));await deleteClass(cls.id);flash("Class removed");}}><IC icon="trash" size={14}/></button></div>
        </div>)}
        <div style={{marginTop:16,background:"var(--input-bg)",borderRadius:12,padding:16,border:"1px solid var(--border-l)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--muted)",marginBottom:10}}>ADD NEW CLASS</div>
          <input className="adm-inp" placeholder="Class name" value={newClass.name} onChange={e=>setNewClass({...newClass,name:e.target.value})}/>
          <input className="adm-inp" placeholder="Days (e.g. Tue & Thu)" value={newClass.days} onChange={e=>setNewClass({...newClass,days:e.target.value})}/>
          <input className="adm-inp" placeholder="Time (e.g. 6:00 PM)" value={newClass.time} onChange={e=>setNewClass({...newClass,time:e.target.value})}/>
          <input className="adm-inp" placeholder="Category" value={newClass.category} onChange={e=>setNewClass({...newClass,category:e.target.value})}/>
          <textarea className="adm-ta" placeholder="Description..." value={newClass.description} onChange={e=>setNewClass({...newClass,description:e.target.value})}/>
          <button className="btn btn-p" onClick={async()=>{
            if(!newClass.name||!newClass.days||!newClass.time)return;
            const cls={...newClass,id:`c${Date.now()}`};
            setClasses(p=>[...p,cls]);
            await saveClass(cls);
            setNewClass({name:"",days:"",time:"",color:"#B91C1C",description:"",category:""});flash("Class added");
          }}><IC icon="plus" size={14} color="white"/> Add Class</button>
        </div>
      </>}
    </div>}

    {tab==="workouts"&&<div className="adm-sec">
      <div className="adm-sec-t"><IC icon="dumbbell" size={18}/> MANAGE WORKOUTS</div>
      <div style={{display:"flex",gap:4,marginBottom:10}}>{Object.keys(workouts).map(c=><button key={c} className={`wo-tab ${woCategory===c?"active":""}`} onClick={()=>setWoCategory(c)}>{c}</button>)}</div>
      <div style={{display:"flex",gap:4,marginBottom:14}}>
        <button className={`wo-dur-btn ${woDuration==="30"?"active":""}`} onClick={()=>setWoDuration("30")}>30 MIN</button>
        <button className={`wo-dur-btn ${woDuration==="60"?"active":""}`} onClick={()=>setWoDuration("60")}>60 MIN</button>
      </div>
      {(workouts[woCategory]?.[woDuration]||[]).map((ex,i)=><div key={ex.id} className="adm-row">
        <div style={{fontFamily:"var(--font-d)",fontSize:16,color:"var(--crimson-l)",width:24,textAlign:"center"}}>{i+1}</div>
        <div className="adm-row-c"><div className="adm-row-t">{ex.name}</div><div className="adm-row-s">{ex.sets} × {ex.reps}</div></div>
        <button className="adm-ib del" onClick={async()=>{
          const u=JSON.parse(JSON.stringify(workouts));
          u[woCategory][woDuration]=u[woCategory][woDuration].filter(e=>e.id!==ex.id);
          setWorkouts(u); await saveWorkouts(u); flash("Removed");
        }}><IC icon="trash" size={14}/></button>
      </div>)}
      <div style={{marginTop:14,background:"var(--input-bg)",borderRadius:12,padding:14,border:"1px solid var(--border-l)"}}>
        <div style={{fontSize:12,fontWeight:700,color:"var(--muted)",marginBottom:8}}>ADD EXERCISE</div>
        <input className="adm-inp" placeholder="Exercise name" value={newExercise.name} onChange={e=>setNewExercise({...newExercise,name:e.target.value})}/>
        <div style={{display:"flex",gap:6}}><input className="adm-inp" type="number" placeholder="Sets" value={newExercise.sets} onChange={e=>setNewExercise({...newExercise,sets:+e.target.value||0})} style={{flex:1}}/>
        <input className="adm-inp" placeholder="Reps" value={newExercise.reps} onChange={e=>setNewExercise({...newExercise,reps:e.target.value})} style={{flex:1}}/></div>
        <button className="btn btn-p" onClick={async()=>{
          if(!newExercise.name)return;
          const u=JSON.parse(JSON.stringify(workouts));
          u[woCategory][woDuration].push({...newExercise,id:`e${Date.now()}`});
          setWorkouts(u); await saveWorkouts(u);
          setNewExercise({name:"",sets:3,reps:"10"});flash("Exercise added");
        }}><IC icon="plus" size={14} color="white"/> Add</button>
      </div>
    </div>}

    {tab==="trainers"&&<div className="adm-sec">
      <div className="adm-sec-t"><IC icon="user" size={18}/> PERSONAL TRAINERS</div>
      {trainers.map(t=><div key={t.id} className="adm-row">
        <div style={{width:36,height:36,borderRadius:10,background:"var(--input-bg)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
          {t.photo?<img src={t.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<IC icon="user" size={16} color="var(--muted)"/>}</div>
        <div className="adm-row-c"><div className="adm-row-t">{t.name}</div><div className="adm-row-s">{t.specialties?.join(", ")}</div></div>
        <button className="adm-ib del" onClick={async()=>{setTrainers(p=>p.filter(x=>x.id!==t.id));await deleteTrainer(t.id);flash("Trainer removed");}}><IC icon="trash" size={14}/></button>
      </div>)}
      <div style={{marginTop:14,background:"var(--input-bg)",borderRadius:12,padding:14,border:"1px solid var(--border-l)"}}>
        <div style={{fontSize:12,fontWeight:700,color:"var(--muted)",marginBottom:8}}>ADD TRAINER</div>
        <input className="adm-inp" placeholder="Trainer name" value={newTrainer.name} onChange={e=>setNewTrainer({...newTrainer,name:e.target.value})}/>
        <textarea className="adm-ta" placeholder="Bio — specialties, certifications, etc." value={newTrainer.bio} onChange={e=>setNewTrainer({...newTrainer,bio:e.target.value})}/>
        <input className="adm-inp" placeholder="Contact info" value={newTrainer.contact} onChange={e=>setNewTrainer({...newTrainer,contact:e.target.value})}/>
        <input className="adm-inp" placeholder="Photo URL" value={newTrainer.photo||""} onChange={e=>setNewTrainer({...newTrainer,photo:e.target.value})}/>
        <div style={{fontSize:12,fontWeight:700,color:"var(--muted)",marginBottom:6,marginTop:4}}>SPECIALTIES (select all that apply)</div>
        <div className="spec-grid">{TRAINER_SPECIALTIES.map(s=><button key={s} className={`spec-chip ${newTrainer.specialties.includes(s)?"on":""}`} onClick={()=>toggleSpec(s)}>{s}</button>)}</div>
        <button className="btn btn-p" onClick={async()=>{
          if(!newTrainer.name)return;
          const t={...newTrainer,id:Date.now()};
          setTrainers(p=>[...p,t]);
          await saveTrainer(t);
          setNewTrainer({name:"",bio:"",contact:"",photo:null,specialties:[]});flash("Trainer added");
        }}><IC icon="plus" size={14} color="white"/> Add Trainer</button>
      </div>
    </div>}

    {tab==="feedback"&&<div className="adm-sec">
      <div className="adm-sec-t"><IC icon="flag" size={18}/> MEMBER FEEDBACK</div>
      {feedback.length===0 ? <div style={{padding:20,textAlign:"center",color:"var(--muted)",fontSize:13}}>No feedback submitted yet. Member submissions will appear here.</div>
      : feedback.map((f,i)=><div key={f.id||i} className="adm-row"><div className="adm-row-c">
        <div className="adm-row-t" style={{textTransform:"capitalize"}}>{f.type}</div>
        <div className="adm-row-s">{f.message}</div>
        {f.createdAt && <div style={{fontSize:10,color:"var(--muted)",marginTop:2}}>{new Date(f.createdAt.seconds*1000).toLocaleDateString()}</div>}
      </div></div>)}
    </div>}
  </div>;
}
// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [page, setPage] = useState("home");
  const [selectedClass, setSelectedClass] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [dark, setDark] = useState(() => loadPref("dark", true));
  const [showInstall, setShowInstall] = useState(() => loadPref("showInstall", true));
  const [notifPrefs, setNotifPrefs] = useState(() => loadPref("notifPrefs", {all:true, announcements:true, classes:true}));
  const [loading, setLoading] = useState(true);

  const [classes, setClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications] = useState([
    { id:1, title:"Welcome to SFC!", body:"You'll get important updates here — class cancellations, schedule changes, and gym news.", time:"Just now", read:false, type:"announcement" },
  ]);
  const [workouts, setWorkouts] = useState(DEFAULT_WORKOUTS);
  const [trainers, setTrainers] = useState([]);
  const [feedback, setFeedback] = useState([]);

  // Save prefs to localStorage when they change
  useEffect(() => { savePref("dark", dark); }, [dark]);
  useEffect(() => { savePref("notifPrefs", notifPrefs); }, [notifPrefs]);
  const dismissInstall = useCallback(() => { setShowInstall(false); savePref("showInstall", false); }, []);

  // Listen for auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAuthed(!!user);
    });
    return unsub;
  }, []);

  // Load data from Firestore (with real-time listeners)
  useEffect(() => {
    let unsubClasses, unsubAnn, unsubTrainers, unsubFeedback;

    const loadData = async () => {
      // Classes listener
      unsubClasses = onSnapshot(collection(db, "classes"), (snap) => {
        if (snap.empty) {
          // Seed with defaults if collection is empty
          DEFAULT_CLASSES.forEach(c => setDoc(doc(db, "classes", c.id), c).catch(()=>{}));
          setClasses(DEFAULT_CLASSES);
        } else {
          setClasses(snap.docs.map(d => ({ ...d.data(), id: d.id })));
        }
      }, (err) => {
        console.error("Classes listener error:", err);
        setClasses(DEFAULT_CLASSES);
      });

      // Announcements listener
      unsubAnn = onSnapshot(collection(db, "announcements"), (snap) => {
        if (snap.empty) {
          DEFAULT_ANNOUNCEMENTS.forEach(a => setDoc(doc(db, "announcements", a.id), a).catch(()=>{}));
          setAnnouncements(DEFAULT_ANNOUNCEMENTS);
        } else {
          const anns = snap.docs.map(d => ({ ...d.data(), id: d.id }));
          anns.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return 0;
          });
          setAnnouncements(anns);
        }
      }, (err) => {
        console.error("Announcements listener error:", err);
        setAnnouncements(DEFAULT_ANNOUNCEMENTS);
      });

      // Trainers listener
      unsubTrainers = onSnapshot(collection(db, "trainers"), (snap) => {
        setTrainers(snap.docs.map(d => ({ ...d.data(), id: d.id })));
      }, () => setTrainers([]));

      // Feedback listener (admin only, but load anyway)
      unsubFeedback = onSnapshot(collection(db, "feedback"), (snap) => {
        setFeedback(snap.docs.map(d => ({ ...d.data(), id: d.id })));
      }, () => setFeedback([]));

      // Workouts (single document)
      try {
        const woSnap = await getDocs(collection(db, "config"));
        const woDoc = woSnap.docs.find(d => d.id === "workouts");
        if (woDoc && woDoc.data().data) {
          setWorkouts(JSON.parse(woDoc.data().data));
        } else {
          await setDoc(doc(db, "config", "workouts"), { data: JSON.stringify(DEFAULT_WORKOUTS) }).catch(()=>{});
          setWorkouts(DEFAULT_WORKOUTS);
        }
      } catch {
        setWorkouts(DEFAULT_WORKOUTS);
      }

      setLoading(false);
    };

    loadData();

    return () => {
      if (unsubClasses) unsubClasses();
      if (unsubAnn) unsubAnn();
      if (unsubTrainers) unsubTrainers();
      if (unsubFeedback) unsubFeedback();
    };
  }, []);

  const hasUnread = notifications.some(n => !n.read);

  const navItems = [
    {id:"home",icon:"home",label:"Home"},
    {id:"schedule",icon:"calendar",label:"Schedule"},
    {id:"workouts",icon:"dumbbell",label:"Workouts"},
    {id:"trainers",icon:"user",label:"Trainers"},
    {id:"contact",icon:"mapPin",label:"Contact"},
    {id:"settings",icon:"settings",label:"Settings"},
  ];

  // Loading screen
  if (loading) return <>
    <style>{getCSS(dark)}</style>
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"var(--bg)"}}>
      <Icons.sfcLogo width={60} height={60}/>
      <div style={{marginTop:16}}><span className="spinner" style={{borderColor:"rgba(185,28,28,.3)",borderTopColor:"#B91C1C"}}/></div>
    </div>
  </>;

  // Admin login screen
  if (showAdmin && !isAuthed) return <>
    <style>{getCSS(dark)}</style>
    <AdminLogin onLogin={()=>{}} onBack={()=>setShowAdmin(false)}/>
  </>;

  // Admin panel (authenticated)
  if (showAdmin && isAuthed) return <>
    <style>{getCSS(dark)}</style>
    <AdminPanel onExit={()=>setShowAdmin(false)} classes={classes} setClasses={setClasses}
      announcements={announcements} setAnnouncements={setAnnouncements}
      workouts={workouts} setWorkouts={setWorkouts} trainers={trainers} setTrainers={setTrainers} feedback={feedback}/>
  </>;

  return <>
    <style>{getCSS(dark)}</style>
    <div className="app">
      <header className="hdr">
        <div className="hdr-brand">
          <div className="hdr-logo"><Icons.sfcLogo width={38} height={38}/></div>
          <div className="hdr-title">SLOCOMB FITNESS</div>
        </div>
        <div className="hdr-actions">
          <button className={`hdr-btn notif ${hasUnread?"has":""}`} onClick={()=>setShowNotifs(true)}><IC icon="bell" size={18}/></button>
          <button className="hdr-btn" onClick={()=>setShowAdmin(true)} title="Admin Login" style={{fontSize:10,fontFamily:"var(--font-d)",letterSpacing:1}}>
            ADM
          </button>
        </div>
      </header>

      {page==="home"&&<HomePage setPage={setPage} setSelectedClass={setSelectedClass} announcements={announcements} classes={classes} showInstall={showInstall} onDismissInstall={dismissInstall}/>}
      {page==="schedule"&&<SchedulePage setSelectedClass={setSelectedClass} classes={classes}/>}
      {page==="workouts"&&<WorkoutsPage workouts={workouts}/>}
      {page==="trainers"&&<TrainersPage trainers={trainers}/>}
      {page==="contact"&&<ContactPage/>}
      {page==="settings"&&<SettingsPage dark={dark} setDark={setDark} notifPrefs={notifPrefs} setNotifPrefs={setNotifPrefs}/>}

      <ClassModal cls={selectedClass} onClose={()=>setSelectedClass(null)}/>
      {showNotifs&&<NotifPanel notifs={notifications} onClose={()=>setShowNotifs(false)}/>}

      <nav className="bnav">
        {navItems.map(item=><button key={item.id} className={`nav-i ${page===item.id?"on":""}`} onClick={()=>setPage(item.id)}>
          <IC icon={item.icon} size={24} className="nav-i-ic"/><span className="nav-i-lb">{item.label}</span>
        </button>)}
      </nav>
    </div>
  </>;
}

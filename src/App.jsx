import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Package, 
  FileText, 
  PlusCircle, 
  TrendingUp, 
  Menu, 
  X, 
  Save, 
  Trash2, 
  Plus, 
  Edit2, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Printer, 
  CreditCard, 
  Wallet, 
  Filter, 
  DollarSign, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Banknote, 
  ClipboardList, 
  Clock, 
  CheckSquare, 
  BookOpen, 
  Scale, 
  Landmark, 
  Anchor, 
  MapPin,
  Lock,
  LogOut,
  Search
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  orderBy, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  deleteDoc, 
  increment, 
  writeBatch 
} from 'firebase/firestore';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyAA4mTxBvsy71nE46Qj1UDYjDOU76O1aes",
  authDomain: "fleetx-wg.firebaseapp.com",
  projectId: "fleetx-wg",
  storageBucket: "fleetx-wg.firebasestorage.app",
  messagingSenderId: "155966676723",
  appId: "1:155966676723:web:f4b6fb2c7778d56ecaa186",
  measurementId: "G-3QDCZSE1LD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

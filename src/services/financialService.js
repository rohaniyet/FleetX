// src/services/financialService.js

import { supabase } from './supabase/client'

/* ==============================
   TRIAL BALANCE
============================== */

export const getTrialBalance = async (tenantId, branchId) => {
  const { data, error } = await supabase
    .from('trial_balance_view')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('branch_id', branchId)

  if (error) throw error
  return data
}

/* ==============================
   PROFIT & LOSS SUMMARY
============================== */

export const getProfitLoss = async (tenantId, branchId) => {
  const { data, error } = await supabase
    .from('branch_profit_loss_summary_view')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('branch_id', branchId)
    .single()

  if (error) throw error
  return data
}

/* ==============================
   BALANCE SHEET
============================== */

export const getBalanceSheet = async (tenantId, branchId) => {
  const { data, error } = await supabase
    .from('balance_sheet_view')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('branch_id', branchId)

  if (error) throw error
  return data
}

/* ==============================
   VEHICLE PERFORMANCE
============================== */

export const getVehiclePerformance = async (tenantId, branchId) => {
  const { data, error } = await supabase
    .from('vehicle_performance_view')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('branch_id', branchId)

  if (error) throw error
  return data
}

/* ==============================
   CLIENT RECEIVABLE SUMMARY
============================== */

export const getClientAging = async (tenantId, branchId) => {
  const { data, error } = await supabase
    .from('client_aging_view')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('branch_id', branchId)

  if (error) throw error
  return data
}

/* ==============================
   VENDOR PAYABLE SUMMARY
============================== */

export const getVendorAging = async (tenantId, branchId) => {
  const { data, error } = await supabase
    .from('vendor_aging_view')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('branch_id', branchId)

  if (error) throw error
  return data
}

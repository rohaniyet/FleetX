class LedgerService {
  // Professional accounting rules
  static ACCOUNT_TYPES = {
    ASSET: 'Asset',
    LIABILITY: 'Liability',
    EQUITY: 'Equity',
    INCOME: 'Income',
    EXPENSE: 'Expense'
  }

  static ACCOUNT_RULES = {
    'Asset': { normalBalance: 'DEBIT', increase: 'DEBIT', decrease: 'CREDIT' },
    'Liability': { normalBalance: 'CREDIT', increase: 'CREDIT', decrease: 'DEBIT' },
    'Equity': { normalBalance: 'CREDIT', increase: 'CREDIT', decrease: 'DEBIT' },
    'Income': { normalBalance: 'CREDIT', increase: 'CREDIT', decrease: 'DEBIT' },
    'Expense': { normalBalance: 'DEBIT', increase: 'DEBIT', decrease: 'CREDIT' }
  }

  // Validate journal entry
  static validateJournalEntry(entries) {
    let totalDebit = 0
    let totalCredit = 0
    
    entries.forEach(entry => {
      if (entry.type === 'DEBIT') {
        totalDebit += parseFloat(entry.amount)
      } else if (entry.type === 'CREDIT') {
        totalCredit += parseFloat(entry.amount)
      }
    })
    
    // Rule 1: Debit must equal Credit
    if (totalDebit !== totalCredit) {
      throw new Error(`Accounting Equation Violated: Debit (${totalDebit}) ≠ Credit (${totalCredit})`)
    }
    
    // Rule 2: At least 2 accounts
    if (entries.length < 2) {
      throw new Error('Minimum 2 accounts required for journal entry')
    }
    
    // Rule 3: No account can have both debit and credit
    const accountTypes = {}
    entries.forEach(entry => {
      if (!accountTypes[entry.accountId]) {
        accountTypes[entry.accountId] = entry.type
      } else if (accountTypes[entry.accountId] !== entry.type) {
        throw new Error(`Account ${entry.accountId} cannot have both debit and credit entries`)
      }
    })
    
    return true
  }

  // Create journal entry for trip
  static async createTripJournal(db, tripData, tenantId) {
    const journalEntries = []
    
    // 1. Debit Client (Accounts Receivable)
    journalEntries.push({
      accountId: tripData.clientId,
      type: 'DEBIT',
      amount: tripData.freightAmount,
      description: `Trip freight for ${tripData.route}`,
      date: new Date(),
      reference: `TRIP-${tripData.id}`,
      accountType: 'Asset' // Accounts Receivable is Asset
    })
    
    // 2. Credit Transport Income
    journalEntries.push({
      accountId: 'transport_income_account',
      type: 'CREDIT',
      amount: tripData.freightAmount,
      description: `Income from trip ${tripData.route}`,
      date: new Date(),
      reference: `TRIP-${tripData.id}`,
      accountType: 'Income'
    })
    
    // 3. If expenses exist, create separate entries
    if (tripData.expenseDetails && tripData.expenseDetails.length > 0) {
      tripData.expenseDetails.forEach(expense => {
        // Debit Expense Account
        journalEntries.push({
          accountId: this.getExpenseAccountId(expense.type),
          type: 'DEBIT',
          amount: expense.amount,
          description: `${expense.name} for trip ${tripData.route}`,
          date: new Date(),
          reference: `TRIP-EXP-${tripData.id}`
        })
        
        // Credit Cash/Bank (assuming cash payment)
        journalEntries.push({
          accountId: 'cash_account',
          type: 'CREDIT',
          amount: expense.amount,
          description: `Paid for ${expense.name}`,
          date: new Date(),
          reference: `TRIP-EXP-${tripData.id}`
        })
      })
    }
    
    // Validate entries
    this.validateJournalEntry(journalEntries)
    
    // Save to database
    const batch = db.batch()
    journalEntries.forEach(entry => {
      const entryRef = db.collection(`${tenantId}_journal_entries`).doc()
      batch.set(entryRef, {
        ...entry,
        tenantId,
        createdAt: new Date(),
        status: 'posted',
        userId: tripData.userId
      })
      
      // Update account balance
      const accountRef = db.collection(`${tenantId}_accounts`).doc(entry.accountId)
      const updateField = entry.type === 'DEBIT' ? 'balance' : 'balance'
      // Balance update logic based on account type
    })
    
    await batch.commit()
    return journalEntries
  }

  // Generate Trial Balance
  static async generateTrialBalance(db, tenantId, date = new Date()) {
    const accountsSnapshot = await db.collection(`${tenantId}_accounts`).get()
    const entriesSnapshot = await db.collection(`${tenantId}_journal_entries`)
      .where('date', '<=', date)
      .get()
    
    const trialBalance = []
    let totalDebit = 0
    let totalCredit = 0
    
    accountsSnapshot.forEach(accountDoc => {
      const account = accountDoc.data()
      const accountEntries = entriesSnapshot.docs
        .filter(doc => doc.data().accountId === accountDoc.id)
        .map(doc => doc.data())
      
      let balance = 0
      accountEntries.forEach(entry => {
        if (entry.type === 'DEBIT') {
          balance += parseFloat(entry.amount)
        } else {
          balance -= parseFloat(entry.amount)
        }
      })
      
      // Adjust based on normal balance
      const rules = this.ACCOUNT_RULES[account.type]
      let debitAmount = 0
      let creditAmount = 0
      
      if (rules.normalBalance === 'DEBIT') {
        debitAmount = balance > 0 ? balance : 0
        creditAmount = balance < 0 ? Math.abs(balance) : 0
      } else {
        creditAmount = balance > 0 ? balance : 0
        debitAmount = balance < 0 ? Math.abs(balance) : 0
      }
      
      trialBalance.push({
        accountCode: account.code,
        accountName: account.name,
        accountType: account.type,
        debit: debitAmount,
        credit: creditAmount
      })
      
      totalDebit += debitAmount
      totalCredit += creditAmount
    })
    
    // Validate accounting equation
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(`Trial Balance doesn't match! Debit: ${totalDebit}, Credit: ${totalCredit}`)
    }
    
    return {
      trialBalance,
      totalDebit,
      totalCredit,
      balanceDate: date,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01
    }
  }

  // Generate Profit & Loss Statement
  static async generateProfitLoss(db, tenantId, startDate, endDate) {
    const incomeAccounts = await db.collection(`${tenantId}_accounts`)
      .where('type', '==', 'Income')
      .get()
    
    const expenseAccounts = await db.collection(`${tenantId}_accounts`)
      .where('type', '==', 'Expense')
      .get()
    
    const entries = await db.collection(`${tenantId}_journal_entries`)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .get()
    
    // Calculate Income
    let totalIncome = 0
    const incomeDetails = []
    
    incomeAccounts.forEach(accountDoc => {
      const account = accountDoc.data()
      const accountEntries = entries.docs
        .filter(doc => doc.data().accountId === accountDoc.id)
        .map(doc => doc.data())
      
      let income = 0
      accountEntries.forEach(entry => {
        if (entry.type === 'CREDIT') {
          income += parseFloat(entry.amount)
        } else {
          income -= parseFloat(entry.amount)
        }
      })
      
      if (income > 0) {
        incomeDetails.push({
          account: account.name,
          amount: income
        })
        totalIncome += income
      }
    })
    
    // Calculate Expenses
    let totalExpenses = 0
    const expenseDetails = []
    
    expenseAccounts.forEach(accountDoc => {
      const account = accountDoc.data()
      const accountEntries = entries.docs
        .filter(doc => doc.data().accountId === accountDoc.id)
        .map(doc => doc.data())
      
      let expense = 0
      accountEntries.forEach(entry => {
        if (entry.type === 'DEBIT') {
          expense += parseFloat(entry.amount)
        } else {
          expense -= parseFloat(entry.amount)
        }
      })
      
      if (expense > 0) {
        expenseDetails.push({
          account: account.name,
          amount: expense
        })
        totalExpenses += expense
      }
    })
    
    const netProfit = totalIncome - totalExpenses
    
    return {
      period: { startDate, endDate },
      income: {
        total: totalIncome,
        details: incomeDetails
      },
      expenses: {
        total: totalExpenses,
        details: expenseDetails
      },
      netProfit: netProfit,
      grossProfit: totalIncome,
      netProfitMargin: totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0
    }
  }

  // Generate Balance Sheet
  static async generateBalanceSheet(db, tenantId, date = new Date()) {
    const accountsSnapshot = await db.collection(`${tenantId}_accounts`).get()
    const entriesSnapshot = await db.collection(`${tenantId}_journal_entries`)
      .where('date', '<=', date)
      .get()
    
    const balanceSheet = {
      assets: { current: [], fixed: [], total: 0 },
      liabilities: { current: [], longTerm: [], total: 0 },
      equity: { capital: [], retainedEarnings: [], total: 0 }
    }
    
    accountsSnapshot.forEach(accountDoc => {
      const account = accountDoc.data()
      const accountEntries = entriesSnapshot.docs
        .filter(doc => doc.data().accountId === accountDoc.id)
        .map(doc => doc.data())
      
      let balance = 0
      accountEntries.forEach(entry => {
        if (entry.type === 'DEBIT') {
          balance += parseFloat(entry.amount)
        } else {
          balance -= parseFloat(entry.amount)
        }
      })
      
      // Adjust for normal balance
      const rules = this.ACCOUNT_RULES[account.type]
      let finalBalance = rules.normalBalance === 'DEBIT' ? balance : -balance
      
      // Categorize
      if (account.type === 'Asset') {
        const assetType = account.category === 'Cash' || account.category === 'Bank' ? 'current' : 'fixed'
        balanceSheet.assets[assetType].push({
          name: account.name,
          balance: finalBalance,
          category: account.category
        })
        balanceSheet.assets.total += finalBalance
      } else if (account.type === 'Liability') {
        const liabilityType = account.category === 'Current' ? 'current' : 'longTerm'
        balanceSheet.liabilities[liabilityType].push({
          name: account.name,
          balance: finalBalance,
          category: account.category
        })
        balanceSheet.liabilities.total += finalBalance
      } else if (account.type === 'Equity' || account.type === 'Capital') {
        balanceSheet.equity.capital.push({
          name: account.name,
          balance: finalBalance,
          category: account.category
        })
        balanceSheet.equity.total += finalBalance
      }
    })
    
    // Add current period profit/loss
    const profitLoss = await this.calculateCurrentProfit(db, tenantId, date)
    balanceSheet.equity.retainedEarnings.push({
      name: 'Current Period Earnings',
      balance: profitLoss,
      category: 'RetainedEarnings'
    })
    balanceSheet.equity.total += profitLoss
    
    // Validate: Assets = Liabilities + Equity
    const totalLiabilitiesEquity = balanceSheet.liabilities.total + balanceSheet.equity.total
    const isBalanced = Math.abs(balanceSheet.assets.total - totalLiabilitiesEquity) < 0.01
    
    if (!isBalanced) {
      console.warn(`Balance Sheet not balanced! Assets: ${balanceSheet.assets.total}, Liabilities+Equity: ${totalLiabilitiesEquity}`)
    }
    
    return {
      ...balanceSheet,
      reportDate: date,
      isBalanced,
      accountingEquation: `Assets (${balanceSheet.assets.total}) = Liabilities (${balanceSheet.liabilities.total}) + Equity (${balanceSheet.equity.total})`
    }
  }
}

export default LedgerService

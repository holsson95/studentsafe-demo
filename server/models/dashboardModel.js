const pool = require('../db');

const getAllCases = async (period = 'day', filter = {}, caseTypeId = 2) => {
  let startDate, endDate, dateFormat, groupByClause, dateTruncUnit;
  
  const today = new Date();
  
  // Set date range and grouping based on period
  switch (period) {
    case 'day':
      // Last 30 days
      endDate = new Date(today);
      startDate = new Date(today);
      startDate.setDate(endDate.getDate() - 29);
      dateFormat = 'YYYY-MM-DD';
      dateTruncUnit = 'day';
      groupByClause = 'DATE_TRUNC(\'day\', created_at)';
      break;
    
    case 'week':
      // Last 4 weeks (28 days)
      endDate = new Date(today);
      startDate = new Date(today);
      startDate.setDate(endDate.getDate() - 27);
      dateFormat = 'YYYY-MM-DD';
      dateTruncUnit = 'week';
      groupByClause = 'DATE_TRUNC(\'week\', created_at)';
      break;
    
    case 'year':
      // Last 12 months
      endDate = new Date(today);
      startDate = new Date(today);
      startDate.setMonth(endDate.getMonth() - 11);
      startDate.setDate(1); // Start from first day of month
      dateFormat = 'YYYY-MM';
      dateTruncUnit = 'month';
      groupByClause = 'DATE_TRUNC(\'month\', created_at)';
      break;
    case 'all':
      
      groupByClause = 'DATE_TRUNC(\'month\', created_at)';
      break;
    default:
      throw new Error('Invalid period. Use "day", "week", or "year"');
  }

  // Build query
  let query = `
    SELECT 
      ${groupByClause} AS period,
      COUNT(*) AS case_count
    FROM cases
    WHERE 1=1
  `;
  
  const params = [];
  let i = 1;
   if (period !== 'all') {
    query += ` AND created_at BETWEEN $${i} AND $${i+1}`;
    params.push(startDate, endDate);
    i += 2;
  }

  if (filter.school_id) {
    query += ` AND school_id = $${i}`;
    params.push(filter.school_id);
    i++;
  }

  if (filter.building_id) {
    query += ` AND building_id = $${i}`;
    params.push(filter.building_id);
    i++;
  }
  
  if (caseTypeId) {
    query += ` AND case_type_id = ANY($${i})`;
    params.push([Number(caseTypeId), 3]);
    i++;
  }

  query += `
    GROUP BY period
    ORDER BY period
  `;

  const result = await pool.query(query, params);
  
  // Generate all expected periods in range for gap filling
  const allPeriods = [];
   if (period === 'all') {
    // Get all unique months from the result
    const uniqueMonths = result.rows.map(row => 
      row.period.toISOString().slice(0, 7)
    ).sort();
    
    if (uniqueMonths.length > 0) {
      const firstMonth = uniqueMonths[0];
      const lastMonth = uniqueMonths[uniqueMonths.length - 1];
      
      // Generate all months between first and last
      const start = new Date(firstMonth + '-01');
      const end = new Date(lastMonth + '-01');
      
      const current = new Date(start);
      while (current <= end) {
        allPeriods.push(current.toISOString().slice(0, 7));
        current.setMonth(current.getMonth() + 1);
      }
    }
  } else {
    // Generate all expected periods in range for gap filling (for day/week/year)
    const current = new Date(startDate);
    
    while (current <= endDate) {
      let periodKey;
      
      if (period === 'day') {
        periodKey = current.toISOString().slice(0, 10);
        current.setDate(current.getDate() + 1);
      } else if (period === 'week') {
        // Get Monday of the week
        const monday = new Date(current);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);
        periodKey = monday.toISOString().slice(0, 10);
        current.setDate(current.getDate() + 7);
      } else { // year (monthly)
        periodKey = current.toISOString().slice(0, 7);
        current.setMonth(current.getMonth() + 1);
      }
      
      allPeriods.push(periodKey);
    }
  }


  // Map existing data for quick access
  const dataByPeriod = new Map();
  result.rows.forEach(row => {
    let periodKey;
    if (period === 'day') {
      periodKey = row.period.toISOString().slice(0, 10);
    } else if (period === 'week') {
      periodKey = row.period.toISOString().slice(0, 10);
    } else { // year (monthly)
      periodKey = row.period.toISOString().slice(0, 7);
    }
    dataByPeriod.set(periodKey, row.case_count);
  });

  let lastCumulative = 0;
  const finalData = [];

  for (const period of allPeriods) {
    const caseCount = dataByPeriod.get(period) || 0;
    const caseCountNum = Number(caseCount) || 0;
    lastCumulative += caseCountNum;
    
    finalData.push({ 
      date: period, 
      cumulative: lastCumulative 
    });
  }

  return finalData;
};


module.exports = { 
    getAllCases,
    
};


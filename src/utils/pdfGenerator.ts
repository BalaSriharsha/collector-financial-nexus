
import { getCurrencySymbol } from "./currency";

export const generatePDF = (data: any[], title: string, type: 'transactions' | 'budgets', currency: string = 'USD') => {
  const currencySymbol = getCurrencySymbol(currency);
  
  // Create a simple HTML structure for the PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${title}</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                color: #333;
            }
            h1 { 
                color: #1e40af; 
                border-bottom: 2px solid #f97316; 
                padding-bottom: 10px;
            }
            table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
            }
            th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left;
            }
            th { 
                background-color: #f8f9fa; 
                font-weight: bold;
            }
            tr:nth-child(even) { 
                background-color: #f9f9f9;
            }
            .total { 
                font-weight: bold; 
                background-color: #e3f2fd !important;
            }
        </style>
    </head>
    <body>
        <h1>${title}</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <p>Currency: ${currency}</p>
        ${generateTableHTML(data, type, currencySymbol)}
    </body>
    </html>
  `;

  // Create a blob and download
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.replace(/\s+/g, '_').toLowerCase()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const generateTableHTML = (data: any[], type: 'transactions' | 'budgets', currencySymbol: string) => {
  if (type === 'transactions') {
    const totalIncome = data.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    
    return `
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Type</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(transaction => `
            <tr>
              <td>${new Date(transaction.date).toLocaleDateString()}</td>
              <td>${transaction.title}</td>
              <td>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</td>
              <td>${transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}</td>
              <td>${currencySymbol}${Number(transaction.amount).toFixed(2)}</td>
              <td>${transaction.description || '-'}</td>
            </tr>
          `).join('')}
          <tr class="total">
            <td colspan="4"><strong>Total Income</strong></td>
            <td><strong>${currencySymbol}${totalIncome.toFixed(2)}</strong></td>
            <td></td>
          </tr>
          <tr class="total">
            <td colspan="4"><strong>Total Expenses</strong></td>
            <td><strong>${currencySymbol}${totalExpense.toFixed(2)}</strong></td>
            <td></td>
          </tr>
          <tr class="total">
            <td colspan="4"><strong>Net Amount</strong></td>
            <td><strong>${currencySymbol}${(totalIncome - totalExpense).toFixed(2)}</strong></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    `;
  } else {
    const totalBudget = data.reduce((sum, b) => sum + Number(b.amount), 0);
    
    return `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Period</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(budget => `
            <tr>
              <td>${budget.name}</td>
              <td>${budget.category.charAt(0).toUpperCase() + budget.category.slice(1)}</td>
              <td>${budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}</td>
              <td>${new Date(budget.start_date).toLocaleDateString()}</td>
              <td>${new Date(budget.end_date).toLocaleDateString()}</td>
              <td>${currencySymbol}${Number(budget.amount).toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr class="total">
            <td colspan="5"><strong>Total Budget</strong></td>
            <td><strong>${currencySymbol}${totalBudget.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
    `;
  }
};

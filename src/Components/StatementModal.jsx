const StatementModal = ({ onClose, statementParams, setStatementParams, onDownload }) => {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="treegar-card w-full max-w-lg p-6 space-y-4">
  
          <h2 className="text-xl font-bold">Download Statement</h2>
  
          <div className="space-y-3">
  
            <input
              type="date"
              value={statementParams.startDate}
              onChange={(e) =>
                setStatementParams({ ...statementParams, startDate: e.target.value })
              }
              className="input-treegar"
            />
  
            <input
              type="date"
              value={statementParams.endDate}
              onChange={(e) =>
                setStatementParams({ ...statementParams, endDate: e.target.value })
              }
              className="input-treegar"
            />
  
            <select
              value={statementParams.transactionType}
              onChange={(e) =>
                setStatementParams({ ...statementParams, transactionType: e.target.value })
              }
              className="input-treegar"
            >
              <option value="">All Transactions</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
  
            <select
              value={statementParams.exportType}
              onChange={(e) =>
                setStatementParams({ ...statementParams, exportType: e.target.value })
              }
              className="input-treegar"
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </select>
  
            <input
              type="email"
              placeholder="Email to send statement to"
              value={statementParams.email}
              onChange={(e) =>
                setStatementParams({ ...statementParams, email: e.target.value })
              }
              className="input-treegar"
            />
          </div>
  
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={onClose} className="btn-treegar-secondary">
              Cancel
            </button>
            <button onClick={onDownload} className="btn-treegar-primary">
              Download
            </button>
          </div>
  
        </div>
      </div>
    );
  };
  
  export default StatementModal
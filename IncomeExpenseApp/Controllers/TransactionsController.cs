using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IncomeExpenseApp.Data;
using IncomeExpenseApp.Models;
using IncomeExpenseApp.Models.DTOs;

namespace IncomeExpenseApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TransactionsController> _logger;

        public TransactionsController(AppDbContext context, ILogger<TransactionsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/transactions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TransactionResponseDto>>> GetTransactions(
            [FromQuery] TransactionType? type = null,
            [FromQuery] string? category = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                var query = _context.Transactions.AsQueryable();

                // Apply filters
                if (type.HasValue)
                    query = query.Where(t => t.Type == type.Value);

                if (!string.IsNullOrEmpty(category))
                    query = query.Where(t => t.Category.Contains(category));

                if (fromDate.HasValue)
                    query = query.Where(t => t.Date >= fromDate.Value);

                if (toDate.HasValue)
                    query = query.Where(t => t.Date <= toDate.Value);

                // Apply pagination
                var transactions = await query
                    .Include(t => t.Account)
                    .OrderByDescending(t => t.Date)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(t => new TransactionResponseDto
                    {
                        Id = t.Id,
                        Description = t.Description,
                        Amount = t.Amount,
                        Type = t.Type,
                        Category = t.Category,
                        AccountId = t.AccountId,
                        AccountName = t.Account!.Name,
                        AccountIcon = t.Account!.Icon,
                        Date = t.Date,
                        Notes = t.Notes,
                        CreatedAt = t.CreatedAt,
                        UpdatedAt = t.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(transactions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transactions");
                return StatusCode(500, "An error occurred while retrieving transactions");
            }
        }

        // GET: api/transactions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TransactionResponseDto>> GetTransaction(int id)
        {
            try
            {
                var transaction = await _context.Transactions
                    .Include(t => t.Account)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (transaction == null)
                {
                    return NotFound($"Transaction with ID {id} not found");
                }

                var responseDto = new TransactionResponseDto
                {
                    Id = transaction.Id,
                    Description = transaction.Description,
                    Amount = transaction.Amount,
                    Type = transaction.Type,
                    Category = transaction.Category,
                    AccountId = transaction.AccountId,
                    AccountName = transaction.Account?.Name,
                    AccountIcon = transaction.Account?.Icon,
                    Date = transaction.Date,
                    Notes = transaction.Notes,
                    CreatedAt = transaction.CreatedAt,
                    UpdatedAt = transaction.UpdatedAt
                };

                return Ok(responseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transaction with ID {TransactionId}", id);
                return StatusCode(500, "An error occurred while retrieving the transaction");
            }
        }

        // POST: api/transactions
        [HttpPost]
        public async Task<ActionResult<TransactionResponseDto>> CreateTransaction(TransactionCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Verify account exists
                var account = await _context.Accounts.FindAsync(createDto.AccountId);
                if (account == null)
                {
                    return BadRequest("Invalid account ID.");
                }

                var transaction = new Transaction
                {
                    Description = createDto.Description,
                    Amount = createDto.Amount,
                    Type = createDto.Type,
                    Category = createDto.Category,
                    AccountId = createDto.AccountId,
                    Date = createDto.Date,
                    Notes = createDto.Notes
                };

                _context.Transactions.Add(transaction);
                
                // Update account balance
                if (transaction.Type == TransactionType.Income)
                {
                    account.Balance += transaction.Amount;
                }
                else
                {
                    account.Balance -= transaction.Amount;
                }
                
                await _context.SaveChangesAsync();

                var responseDto = new TransactionResponseDto
                {
                    Id = transaction.Id,
                    Description = transaction.Description,
                    Amount = transaction.Amount,
                    Type = transaction.Type,
                    Category = transaction.Category,
                    AccountId = transaction.AccountId,
                    AccountName = account.Name,
                    AccountIcon = account.Icon,
                    Date = transaction.Date,
                    Notes = transaction.Notes,
                    CreatedAt = transaction.CreatedAt,
                    UpdatedAt = transaction.UpdatedAt
                };

                return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, responseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating transaction");
                return StatusCode(500, "An error occurred while creating the transaction");
            }
        }

        // PUT: api/transactions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTransaction(int id, TransactionUpdateDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var transaction = await _context.Transactions
                    .Include(t => t.Account)
                    .FirstOrDefaultAsync(t => t.Id == id);
                    
                if (transaction == null)
                {
                    return NotFound($"Transaction with ID {id} not found");
                }

                // Store old values for balance adjustment
                var oldAmount = transaction.Amount;
                var oldType = transaction.Type;
                var oldAccountId = transaction.AccountId;

                // Verify new account exists if changed
                if (updateDto.AccountId != transaction.AccountId)
                {
                    var newAccount = await _context.Accounts.FindAsync(updateDto.AccountId);
                    if (newAccount == null)
                    {
                        return BadRequest("Invalid account ID.");
                    }
                }

                transaction.Description = updateDto.Description;
                transaction.Amount = updateDto.Amount;
                transaction.Type = updateDto.Type;
                transaction.Category = updateDto.Category;
                transaction.AccountId = updateDto.AccountId;
                transaction.Date = updateDto.Date;
                transaction.Notes = updateDto.Notes;

                // Adjust account balances
                // First, reverse the old transaction
                var oldAccount = await _context.Accounts.FindAsync(oldAccountId);
                if (oldAccount != null)
                {
                    if (oldType == TransactionType.Income)
                    {
                        oldAccount.Balance -= oldAmount;
                    }
                    else
                    {
                        oldAccount.Balance += oldAmount;
                    }
                }

                // Then, apply the new transaction
                var updatedAccount = await _context.Accounts.FindAsync(updateDto.AccountId);
                if (updatedAccount != null)
                {
                    if (transaction.Type == TransactionType.Income)
                    {
                        updatedAccount.Balance += transaction.Amount;
                    }
                    else
                    {
                        updatedAccount.Balance -= transaction.Amount;
                    }
                }

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating transaction with ID {TransactionId}", id);
                return StatusCode(500, "An error occurred while updating the transaction");
            }
        }

        // DELETE: api/transactions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            try
            {
                var transaction = await _context.Transactions
                    .Include(t => t.Account)
                    .FirstOrDefaultAsync(t => t.Id == id);
                    
                if (transaction == null)
                {
                    return NotFound($"Transaction with ID {id} not found");
                }

                // Reverse the transaction from account balance
                if (transaction.Account != null)
                {
                    if (transaction.Type == TransactionType.Income)
                    {
                        transaction.Account.Balance -= transaction.Amount;
                    }
                    else
                    {
                        transaction.Account.Balance += transaction.Amount;
                    }
                }

                _context.Transactions.Remove(transaction);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting transaction with ID {TransactionId}", id);
                return StatusCode(500, "An error occurred while deleting the transaction");
            }
        }

        // GET: api/transactions/summary
        [HttpGet("summary")]
        public async Task<ActionResult<object>> GetSummary(
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            try
            {
                var query = _context.Transactions.AsQueryable();

                if (fromDate.HasValue)
                    query = query.Where(t => t.Date >= fromDate.Value);

                if (toDate.HasValue)
                    query = query.Where(t => t.Date <= toDate.Value);

                // Select only the columns we need to avoid CategoryId issues
                var allTransactions = await query
                    .Select(t => new { t.Amount, t.Type })
                    .ToListAsync();
                
                var totalIncome = allTransactions
                    .Where(t => t.Type == TransactionType.Income)
                    .Sum(t => t.Amount);

                var totalExpense = allTransactions
                    .Where(t => t.Type == TransactionType.Expense)
                    .Sum(t => t.Amount);

                var balance = totalIncome - totalExpense;

                var summary = new
                {
                    TotalIncome = totalIncome,
                    TotalExpense = totalExpense,
                    Balance = balance,
                    FromDate = fromDate,
                    ToDate = toDate
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transaction summary");
                return StatusCode(500, "An error occurred while retrieving the summary");
            }
        }

        // GET: api/transactions/categories
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<string>>> GetCategories()
        {
            try
            {
                var categories = await _context.Transactions
                    .Select(t => t.Category)
                    .Distinct()
                    .OrderBy(c => c)
                    .ToListAsync();

                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories");
                return StatusCode(500, "An error occurred while retrieving categories");
            }
        }
    }
}
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
                var transaction = await _context.Transactions.FindAsync(id);

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

                var transaction = new Transaction
                {
                    Description = createDto.Description,
                    Amount = createDto.Amount,
                    Type = createDto.Type,
                    Category = createDto.Category,
                    Date = createDto.Date,
                    Notes = createDto.Notes
                };

                _context.Transactions.Add(transaction);
                await _context.SaveChangesAsync();

                var responseDto = new TransactionResponseDto
                {
                    Id = transaction.Id,
                    Description = transaction.Description,
                    Amount = transaction.Amount,
                    Type = transaction.Type,
                    Category = transaction.Category,
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

                var transaction = await _context.Transactions.FindAsync(id);
                if (transaction == null)
                {
                    return NotFound($"Transaction with ID {id} not found");
                }

                transaction.Description = updateDto.Description;
                transaction.Amount = updateDto.Amount;
                transaction.Type = updateDto.Type;
                transaction.Category = updateDto.Category;
                transaction.Date = updateDto.Date;
                transaction.Notes = updateDto.Notes;

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
                var transaction = await _context.Transactions.FindAsync(id);
                if (transaction == null)
                {
                    return NotFound($"Transaction with ID {id} not found");
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

                // Load to memory first to avoid SQLite decimal sum issues
                var allTransactions = await query.ToListAsync();
                
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
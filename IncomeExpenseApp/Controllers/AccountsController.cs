using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IncomeExpenseApp.Data;
using IncomeExpenseApp.Models;
using IncomeExpenseApp.Models.DTOs;

namespace IncomeExpenseApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AccountsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AccountResponseDto>>> GetAccounts()
        {
            var accounts = await _context.Accounts
                .Include(a => a.Transactions)
                .OrderBy(a => a.Name)
                .ToListAsync();

            var accountDtos = accounts.Select(a => new AccountResponseDto
            {
                Id = a.Id,
                Name = a.Name,
                Description = a.Description,
                Type = a.Type,
                Icon = a.Icon,
                Balance = a.Balance,
                IsDefault = a.IsDefault,
                CreatedAt = a.CreatedAt,
                TransactionCount = a.Transactions.Count
            });

            return Ok(accountDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AccountResponseDto>> GetAccount(int id)
        {
            var account = await _context.Accounts
                .Include(a => a.Transactions)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (account == null)
            {
                return NotFound();
            }

            var accountDto = new AccountResponseDto
            {
                Id = account.Id,
                Name = account.Name,
                Description = account.Description,
                Type = account.Type,
                Icon = account.Icon,
                Balance = account.Balance,
                IsDefault = account.IsDefault,
                CreatedAt = account.CreatedAt,
                TransactionCount = account.Transactions.Count
            };

            return Ok(accountDto);
        }

        [HttpPost]
        public async Task<ActionResult<AccountResponseDto>> CreateAccount(AccountCreateDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if account name already exists
            var existingAccount = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Name.ToLower() == createDto.Name.ToLower());

            if (existingAccount != null)
            {
                return BadRequest("An account with this name already exists.");
            }

            var account = new Account
            {
                Name = createDto.Name,
                Description = createDto.Description,
                Type = createDto.Type,
                Icon = createDto.Icon,
                Balance = createDto.InitialBalance,
                IsDefault = false
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            var accountDto = new AccountResponseDto
            {
                Id = account.Id,
                Name = account.Name,
                Description = account.Description,
                Type = account.Type,
                Icon = account.Icon,
                Balance = account.Balance,
                IsDefault = account.IsDefault,
                CreatedAt = account.CreatedAt,
                TransactionCount = 0
            };

            return CreatedAtAction(nameof(GetAccount), new { id = account.Id }, accountDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAccount(int id, AccountUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var account = await _context.Accounts.FindAsync(id);
            if (account == null)
            {
                return NotFound();
            }

            // Check if new name conflicts with existing account (excluding current account)
            var existingAccount = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Name.ToLower() == updateDto.Name.ToLower() && a.Id != id);

            if (existingAccount != null)
            {
                return BadRequest("An account with this name already exists.");
            }

            account.Name = updateDto.Name;
            account.Description = updateDto.Description;
            account.Type = updateDto.Type;
            account.Icon = updateDto.Icon;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccount(int id)
        {
            var account = await _context.Accounts
                .Include(a => a.Transactions)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (account == null)
            {
                return NotFound();
            }

            // Prevent deletion of default accounts
            if (account.IsDefault)
            {
                return BadRequest("Cannot delete default accounts.");
            }

            // Check if account has transactions
            if (account.Transactions.Any())
            {
                return BadRequest("Cannot delete account that has transactions. Please move or delete all transactions first.");
            }

            _context.Accounts.Remove(account);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/adjust-balance")]
        public async Task<ActionResult<AccountResponseDto>> AdjustBalance(int id, AccountBalanceUpdateDto adjustmentDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var account = await _context.Accounts.FindAsync(id);
            if (account == null)
            {
                return NotFound();
            }

            // Adjust balance based on transaction type
            if (adjustmentDto.Type == TransactionType.Income)
            {
                account.Balance += adjustmentDto.Amount;
            }
            else
            {
                account.Balance -= adjustmentDto.Amount;
            }

            await _context.SaveChangesAsync();

            var accountDto = new AccountResponseDto
            {
                Id = account.Id,
                Name = account.Name,
                Description = account.Description,
                Type = account.Type,
                Icon = account.Icon,
                Balance = account.Balance,
                IsDefault = account.IsDefault,
                CreatedAt = account.CreatedAt,
                TransactionCount = await _context.Transactions.CountAsync(t => t.AccountId == account.Id)
            };

            return Ok(accountDto);
        }
        
        [HttpPost("transfer")]
        public async Task<ActionResult> TransferMoney([FromBody] TransferDto transferDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (transferDto.FromAccountId == transferDto.ToAccountId)
            {
                return BadRequest("Cannot transfer to the same account");
            }

            if (transferDto.Amount <= 0)
            {
                return BadRequest("Transfer amount must be positive");
            }

            var fromAccount = await _context.Accounts.FindAsync(transferDto.FromAccountId);
            var toAccount = await _context.Accounts.FindAsync(transferDto.ToAccountId);

            if (fromAccount == null || toAccount == null)
            {
                return NotFound("One or both accounts not found");
            }

            // Create two transactions: one debit from source, one credit to destination
            var now = DateTime.UtcNow;
            var transferDescription = string.IsNullOrEmpty(transferDto.Description) 
                ? $"Transfer from {fromAccount.Name} to {toAccount.Name}" 
                : transferDto.Description;

            var debitTransaction = new Transaction
            {
                Description = string.IsNullOrEmpty(transferDto.Description) 
                    ? $"Transfer to {toAccount.Name}" 
                    : transferDto.Description,
                Amount = transferDto.Amount,
                Type = TransactionType.Expense,
                Category = "Transfer",
                AccountId = transferDto.FromAccountId,
                Date = DateTime.Parse(transferDto.Date),
                CreatedAt = now,
                UpdatedAt = now
            };

            var creditTransaction = new Transaction
            {
                Description = string.IsNullOrEmpty(transferDto.Description) 
                    ? $"Transfer from {fromAccount.Name}" 
                    : transferDto.Description,
                Amount = transferDto.Amount,
                Type = TransactionType.Income,
                Category = "Transfer",
                AccountId = transferDto.ToAccountId,
                Date = DateTime.Parse(transferDto.Date),
                CreatedAt = now,
                UpdatedAt = now
            };

            _context.Transactions.AddRange(debitTransaction, creditTransaction);
            
            // Update account balances
            fromAccount.Balance -= transferDto.Amount;
            fromAccount.UpdatedAt = now;
            
            toAccount.Balance += transferDto.Amount;
            toAccount.UpdatedAt = now;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Transfer completed successfully" });
        }
    }
}
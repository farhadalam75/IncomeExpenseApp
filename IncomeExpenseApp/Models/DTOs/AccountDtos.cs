using IncomeExpenseApp.Models;

namespace IncomeExpenseApp.Models.DTOs
{
    public class AccountCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public AccountType Type { get; set; }
        public string Icon { get; set; } = "💰";
        public decimal InitialBalance { get; set; } = 0;
    }

    public class AccountUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public AccountType Type { get; set; }
        public string Icon { get; set; } = "💰";
    }

    public class AccountResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public AccountType Type { get; set; }
        public string Icon { get; set; } = "💰";
        public decimal Balance { get; set; }
        public bool IsDefault { get; set; }
        public DateTime CreatedAt { get; set; }
        public int TransactionCount { get; set; }
    }

    public class AccountBalanceUpdateDto
    {
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public TransactionType Type { get; set; }
    }
    
    public class TransferDto
    {
        public int FromAccountId { get; set; }
        public int ToAccountId { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public string Date { get; set; } = DateTime.Today.ToString("yyyy-MM-dd");
    }
}
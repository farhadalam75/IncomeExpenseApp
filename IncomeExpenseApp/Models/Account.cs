using System.ComponentModel.DataAnnotations;

namespace IncomeExpenseApp.Models
{
    public enum AccountType
    {
        Cash = 0,
        Bank = 1,
        CreditCard = 2,
        Investment = 3,
        Savings = 4,
        Other = 5
    }

    public class Account
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        [Required]
        public AccountType Type { get; set; }
        
        [Required]
        public string Icon { get; set; } = "💰"; // Default icon
        
        [Required]
        public decimal Balance { get; set; } = 0;
        
        public bool IsDefault { get; set; } = false;
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime UpdatedAt { get; set; }
        
        // Navigation property
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}
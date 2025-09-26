using System.ComponentModel.DataAnnotations;

namespace IncomeExpenseApp.Models
{
    public class Transaction
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }
        
        [Required]
        public TransactionType Type { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty;
        
        [Required]
        public int AccountId { get; set; }
        
        public DateTime Date { get; set; } = DateTime.Now;
        
        // Navigation property
        public Account? Account { get; set; }
        
        public string? Notes { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
    
    public enum TransactionType
    {
        Income = 1,
        Expense = 2
    }
}
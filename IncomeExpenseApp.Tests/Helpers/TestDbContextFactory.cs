using Microsoft.EntityFrameworkCore;
using IncomeExpenseApp.Data;
using IncomeExpenseApp.Models;

namespace IncomeExpenseApp.Tests.Helpers
{
    public static class TestDbContextFactory
    {
        public static AppDbContext CreateInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString()) // Use unique database name for each test
                .Options;

            return new AppDbContext(options);
        }

        public static void SeedTestData(AppDbContext context)
        {
            // Seed accounts first
            var accounts = new List<Account>
            {
                new Account 
                { 
                    Id = 1, 
                    Name = "Test Cash Account", 
                    Type = AccountType.Cash, 
                    Icon = "💵", 
                    Balance = 0, 
                    IsDefault = true, 
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Account 
                { 
                    Id = 2, 
                    Name = "Test Bank Account", 
                    Type = AccountType.Bank, 
                    Icon = "🏦", 
                    Balance = 0, 
                    IsDefault = true, 
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };

            context.Accounts.AddRange(accounts);
            context.SaveChanges();

            var categories = new List<Category>
            {
                new Category { Id = 1, Name = "Salary", Type = TransactionType.Income, Description = "Income from employment", IsDefault = true, CreatedAt = DateTime.UtcNow },
                new Category { Id = 2, Name = "Food", Type = TransactionType.Expense, Description = "Food and dining expenses", IsDefault = true, CreatedAt = DateTime.UtcNow },
                new Category { Id = 3, Name = "Transport", Type = TransactionType.Expense, Description = "Transportation costs", IsDefault = false, CreatedAt = DateTime.UtcNow },
                new Category { Id = 4, Name = "Entertainment", Type = TransactionType.Expense, Description = "Fun and entertainment", IsDefault = false, CreatedAt = DateTime.UtcNow }
            };

            context.Categories.AddRange(categories);
            context.SaveChanges();

            var transactions = new List<Transaction>
            {
                new Transaction
                {
                    Id = 1,
                    Description = "Monthly Salary",
                    Amount = 5000m,
                    Type = TransactionType.Income,
                    Category = "Salary",
                    AccountId = 1, // Use Test Cash Account
                    Date = DateTime.Today.AddDays(-1),
                    Notes = "Monthly salary payment",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Transaction
                {
                    Id = 2,
                    Description = "Grocery Shopping",
                    Amount = 150m,
                    Type = TransactionType.Expense,
                    Category = "Food",
                    AccountId = 1, // Use Test Cash Account
                    Date = DateTime.Today,
                    Notes = "Weekly groceries",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };

            context.Transactions.AddRange(transactions);
            context.SaveChanges();

            // Update account balances based on transactions
            accounts[0].Balance = 5000m - 150m; // Cash account: +5000 (income) - 150 (expense) = 4850
            context.SaveChanges();
        }
    }
}
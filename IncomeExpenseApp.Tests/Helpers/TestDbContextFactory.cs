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
            var categories = new List<Category>
            {
                new Category { Id = 1, Name = "Salary", Type = TransactionType.Income, Description = "Income from employment", IsDefault = true },
                new Category { Id = 2, Name = "Food", Type = TransactionType.Expense, Description = "Food and dining expenses", IsDefault = true },
                new Category { Id = 3, Name = "Transport", Type = TransactionType.Expense, Description = "Transportation costs", IsDefault = false },
                new Category { Id = 4, Name = "Entertainment", Type = TransactionType.Expense, Description = "Fun and entertainment", IsDefault = false }
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
                    Date = DateTime.Today.AddDays(-1),
                    Notes = "Monthly salary payment"
                },
                new Transaction
                {
                    Id = 2,
                    Description = "Grocery Shopping",
                    Amount = 150m,
                    Type = TransactionType.Expense,
                    Category = "Food",
                    Date = DateTime.Today,
                    Notes = "Weekly groceries"
                }
            };

            context.Transactions.AddRange(transactions);
            context.SaveChanges();
        }
    }
}
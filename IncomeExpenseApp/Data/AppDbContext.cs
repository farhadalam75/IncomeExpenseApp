using Microsoft.EntityFrameworkCore;
using IncomeExpenseApp.Models;

namespace IncomeExpenseApp.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Category> Categories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configure Transaction entity
            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Type).IsRequired();
                entity.Property(e => e.Category).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Date).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt).IsRequired();
                
                // Index for better query performance
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.Date);
                entity.HasIndex(e => e.Category);
            });

            // Configure Category entity
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Type).IsRequired();
                entity.Property(e => e.IsDefault).IsRequired().HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).IsRequired();
                
                // Unique constraint on Name and Type
                entity.HasIndex(e => new { e.Name, e.Type }).IsUnique();
            });
            
            // Seed some default categories
            SeedData(modelBuilder);
        }
        
        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed default income categories
            var incomeCategories = new[]
            {
                new Category { Id = 1, Name = "Salary", Type = TransactionType.Income, IsDefault = true },
                new Category { Id = 2, Name = "Freelance", Type = TransactionType.Income, IsDefault = true },
                new Category { Id = 3, Name = "Investment", Type = TransactionType.Income, IsDefault = true },
                new Category { Id = 4, Name = "Gift", Type = TransactionType.Income, IsDefault = true },
                new Category { Id = 5, Name = "Bonus", Type = TransactionType.Income, IsDefault = true },
                new Category { Id = 6, Name = "Rental Income", Type = TransactionType.Income, IsDefault = true },
                new Category { Id = 7, Name = "Refund", Type = TransactionType.Income, IsDefault = true },
                new Category { Id = 8, Name = "Other Income", Type = TransactionType.Income, IsDefault = true }
            };

            // Seed default expense categories
            var expenseCategories = new[]
            {
                new Category { Id = 9, Name = "Food & Dining", Type = TransactionType.Expense, IsDefault = true },
                new Category { Id = 10, Name = "Transportation", Type = TransactionType.Expense, IsDefault = true },
                new Category { Id = 11, Name = "Housing", Type = TransactionType.Expense, IsDefault = true },
                new Category { Id = 12, Name = "Utilities", Type = TransactionType.Expense, IsDefault = true },
                new Category { Id = 13, Name = "Entertainment", Type = TransactionType.Expense, IsDefault = true },
                new Category { Id = 14, Name = "Shopping", Type = TransactionType.Expense, IsDefault = true },
                new Category { Id = 15, Name = "Healthcare", Type = TransactionType.Expense, IsDefault = true },
                new Category { Id = 16, Name = "Education", Type = TransactionType.Expense, IsDefault = true },
                new Category { Id = 17, Name = "Insurance", Type = TransactionType.Expense, IsDefault = true },
                new Category { Id = 18, Name = "Subscriptions", Type = TransactionType.Expense, IsDefault = true },
                new Category { Id = 19, Name = "Travel", Type = TransactionType.Expense, IsDefault = true },
                new Category { Id = 20, Name = "Other Expense", Type = TransactionType.Expense, IsDefault = true }
            };

            modelBuilder.Entity<Category>().HasData(incomeCategories);
            modelBuilder.Entity<Category>().HasData(expenseCategories);
        }
        
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker
                .Entries()
                .Where(e => e.Entity is Transaction && (
                    e.State == EntityState.Added || e.State == EntityState.Modified));

            foreach (var entityEntry in entries)
            {
                if (entityEntry.Entity is Transaction transaction)
                {
                    if (entityEntry.State == EntityState.Added)
                    {
                        transaction.CreatedAt = DateTime.UtcNow;
                    }
                    transaction.UpdatedAt = DateTime.UtcNow;
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}
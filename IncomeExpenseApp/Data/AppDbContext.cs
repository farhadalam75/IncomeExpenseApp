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
        public DbSet<Account> Accounts { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
        }

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
                entity.Property(e => e.AccountId).IsRequired();
                entity.Property(e => e.Date).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt).IsRequired();
                
                // Index for better query performance
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.Date);
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.AccountId);
                
                // Foreign key relationship
                entity.HasOne(e => e.Account)
                      .WithMany(a => a.Transactions)
                      .HasForeignKey(e => e.AccountId)
                      .OnDelete(DeleteBehavior.Restrict);
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

            // Configure Account entity
            modelBuilder.Entity<Account>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Type).IsRequired();
                entity.Property(e => e.Icon).IsRequired().HasMaxLength(10);
                entity.Property(e => e.Balance).HasColumnType("decimal(18,2)");
                entity.Property(e => e.IsDefault).IsRequired().HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt).IsRequired();
                
                // Unique constraint on Name
                entity.HasIndex(e => e.Name).IsUnique();
            });
            
            // Seed some default categories
            SeedData(modelBuilder);
        }
        
        private void SeedData(ModelBuilder modelBuilder)
        {
            var defaultDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            
            // Seed default income categories
            var incomeCategories = new[]
            {
                new Category { Id = 1, Name = "Salary", Type = TransactionType.Income, IsDefault = true, CreatedAt = defaultDate },
                new Category { Id = 2, Name = "Deposits", Type = TransactionType.Income, IsDefault = true, CreatedAt = defaultDate },
                new Category { Id = 3, Name = "Savings", Type = TransactionType.Income, IsDefault = true, CreatedAt = defaultDate },
                new Category { Id = 4, Name = "Gift", Type = TransactionType.Income, IsDefault = true, CreatedAt = defaultDate },
                new Category { Id = 5, Name = "Bonus", Type = TransactionType.Income, IsDefault = true, CreatedAt = defaultDate },
                new Category { Id = 6, Name = "Refund", Type = TransactionType.Income, IsDefault = true, CreatedAt = defaultDate }
            };

            // Seed default expense categories
            var expenseCategories = new[]
            {
                new Category { Id = 7, Name = "Food & Dining", Type = TransactionType.Expense, IsDefault = true, CreatedAt = defaultDate },
                new Category { Id = 8, Name = "Transportation", Type = TransactionType.Expense, IsDefault = true, CreatedAt = defaultDate },
                new Category { Id = 9, Name = "Housing", Type = TransactionType.Expense, IsDefault = true, CreatedAt = defaultDate },
                new Category { Id = 10, Name = "Utilities", Type = TransactionType.Expense, IsDefault = true, CreatedAt = defaultDate },
                new Category { Id = 11, Name = "Entertainment", Type = TransactionType.Expense, IsDefault = true, CreatedAt = defaultDate },
                new Category { Id = 12, Name = "Shopping", Type = TransactionType.Expense, IsDefault = true, CreatedAt = defaultDate },
                new Category { Id = 13, Name = "Healthcare", Type = TransactionType.Expense, IsDefault = true, CreatedAt = defaultDate },
                new Category { Id = 14, Name = "Education", Type = TransactionType.Expense, IsDefault = true, CreatedAt = defaultDate },
                new Category { Id = 15, Name = "Travel", Type = TransactionType.Expense, IsDefault = true, CreatedAt = defaultDate },
                new Category { Id = 16, Name = "Other Expense", Type = TransactionType.Expense, IsDefault = true, CreatedAt = defaultDate }
            };

            modelBuilder.Entity<Category>().HasData(incomeCategories);
            modelBuilder.Entity<Category>().HasData(expenseCategories);
            
            // Seed default accounts
            var defaultAccounts = new[]
            {
                new Account 
                { 
                    Id = 1, 
                    Name = "Cash", 
                    Type = AccountType.Cash, 
                    Icon = "💵", 
                    Balance = 0, 
                    IsDefault = true, 
                    CreatedAt = defaultDate,
                    UpdatedAt = defaultDate
                },
                new Account 
                { 
                    Id = 2, 
                    Name = "Bank Account", 
                    Type = AccountType.Bank, 
                    Icon = "🏦", 
                    Balance = 0, 
                    IsDefault = true, 
                    CreatedAt = defaultDate,
                    UpdatedAt = defaultDate
                },
                new Account 
                { 
                    Id = 3, 
                    Name = "Credit Card", 
                    Type = AccountType.CreditCard, 
                    Icon = "💳", 
                    Balance = 0, 
                    IsDefault = true, 
                    CreatedAt = defaultDate,
                    UpdatedAt = defaultDate
                },
                new Account 
                { 
                    Id = 4, 
                    Name = "Savings Account", 
                    Type = AccountType.Savings, 
                    Icon = "🏛️", 
                    Balance = 0, 
                    IsDefault = true, 
                    CreatedAt = defaultDate,
                    UpdatedAt = defaultDate
                }
            };
            
            modelBuilder.Entity<Account>().HasData(defaultAccounts);
        }
        
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            // Handle Transaction timestamps
            var transactionEntries = ChangeTracker
                .Entries()
                .Where(e => e.Entity is Transaction && (
                    e.State == EntityState.Added || e.State == EntityState.Modified));

            foreach (var entityEntry in transactionEntries)
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

            // Handle Category timestamps
            var categoryEntries = ChangeTracker
                .Entries()
                .Where(e => e.Entity is Category && e.State == EntityState.Added);

            foreach (var entityEntry in categoryEntries)
            {
                if (entityEntry.Entity is Category category)
                {
                    if (category.CreatedAt == default(DateTime))
                    {
                        category.CreatedAt = DateTime.UtcNow;
                    }
                }
            }

            // Handle Account timestamps
            var accountEntries = ChangeTracker
                .Entries()
                .Where(e => e.Entity is Account && (
                    e.State == EntityState.Added || e.State == EntityState.Modified));

            foreach (var entityEntry in accountEntries)
            {
                if (entityEntry.Entity is Account account)
                {
                    if (entityEntry.State == EntityState.Added)
                    {
                        if (account.CreatedAt == default(DateTime))
                        {
                            account.CreatedAt = DateTime.UtcNow;
                        }
                    }
                    account.UpdatedAt = DateTime.UtcNow;
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}
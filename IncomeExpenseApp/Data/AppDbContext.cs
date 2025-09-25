using Microsoft.EntityFrameworkCore;using Microsoft.En            // Configure Transaction entity

using IncomeExpenseApp.Models;            modelBuilder.Entity<Transaction>(entity =>

            {

namespace IncomeExpenseApp.Data                entity.HasKey(e => e.Id);

{                entity.Property(e => e.Description).IsRequired().HasMaxLength(200);

    public class AppDbContext : DbContext                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");

    {                entity.Property(e => e.Type).IsRequired();

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)                entity.Property(e => e.Category).IsRequired().HasMaxLength(100);

        {                entity.Property(e => e.Date).IsRequired();

        }                entity.Property(e => e.CreatedAt).IsRequired();

                entity.Property(e => e.UpdatedAt).IsRequired();

        public DbSet<Transaction> Transactions { get; set; }                

        public DbSet<Category> Categories { get; set; }                // Index for better query performance

                entity.HasIndex(e => e.Type);

        protected override void OnModelCreating(ModelBuilder modelBuilder)                entity.HasIndex(e => e.Date);

        {                entity.HasIndex(e => e.Category);

            base.OnModelCreating(modelBuilder);                

                            // Ensure Category is treated as a simple string property, not a navigation

            // Configure Transaction entity - explicitly prevent relationships                entity.Property(e => e.Category).HasColumnName("Category");

            modelBuilder.Entity<Transaction>(entity =>            });;

            {using IncomeExpenseApp.Models;

                entity.HasKey(e => e.Id);

                entity.Property(e => e.Description).IsRequired().HasMaxLength(200);namespace IncomeExpenseApp.Data

                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");{

                entity.Property(e => e.Type).IsRequired();    public class AppDbContext : DbContext

                entity.Property(e => e.Category).IsRequired().HasMaxLength(100);    {

                entity.Property(e => e.Date).IsRequired();        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)

                entity.Property(e => e.CreatedAt).IsRequired();        {

                entity.Property(e => e.UpdatedAt).IsRequired();        }

                        

                // Index for better query performance        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)

                entity.HasIndex(e => e.Type);        {

                entity.HasIndex(e => e.Date);            // Disable automatic relationship discovery

                entity.HasIndex(e => e.Category);            if (!optionsBuilder.IsConfigured)

            });            {

                optionsBuilder.UseSqlite();

            // Configure Category entity - separate and independent            }

            modelBuilder.Entity<Category>(entity =>        }

            {

                entity.HasKey(e => e.Id);        public DbSet<Transaction> Transactions { get; set; }

                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);        public DbSet<Category> Categories { get; set; }

                entity.Property(e => e.Description).HasMaxLength(500);

                entity.Property(e => e.Type).IsRequired();        protected override void OnModelCreating(ModelBuilder modelBuilder)

                entity.Property(e => e.IsDefault).IsRequired().HasDefaultValue(false);        {

                entity.Property(e => e.CreatedAt).IsRequired();            base.OnModelCreating(modelBuilder);

                            

                // Unique constraint on Name and Type            // Configure Transaction entity

                entity.HasIndex(e => new { e.Name, e.Type }).IsUnique();            modelBuilder.Entity<Transaction>(entity =>

            });            {

                            entity.HasKey(e => e.Id);

            // Seed some default categories                entity.Property(e => e.Description).IsRequired().HasMaxLength(200);

            SeedData(modelBuilder);                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");

        }                entity.Property(e => e.Type).IsRequired();

                        entity.Property(e => e.Category).IsRequired().HasMaxLength(100);

        private void SeedData(ModelBuilder modelBuilder)                entity.Property(e => e.Date).IsRequired();

        {                entity.Property(e => e.CreatedAt).IsRequired();

            // Seed default income categories                entity.Property(e => e.UpdatedAt).IsRequired();

            var incomeCategories = new[]                

            {                // Index for better query performance

                new Category { Id = 1, Name = "Salary", Type = TransactionType.Income, IsDefault = true },                entity.HasIndex(e => e.Type);

                new Category { Id = 2, Name = "Freelance", Type = TransactionType.Income, IsDefault = true },                entity.HasIndex(e => e.Date);

                new Category { Id = 3, Name = "Investment", Type = TransactionType.Income, IsDefault = true },                entity.HasIndex(e => e.Category);

                new Category { Id = 4, Name = "Gift", Type = TransactionType.Income, IsDefault = true },                

                new Category { Id = 5, Name = "Bonus", Type = TransactionType.Income, IsDefault = true },                // Explicitly ignore any navigation properties to Category entity

                new Category { Id = 6, Name = "Rental Income", Type = TransactionType.Income, IsDefault = true },                entity.Ignore("CategoryId");

                new Category { Id = 7, Name = "Refund", Type = TransactionType.Income, IsDefault = true },            });

                new Category { Id = 8, Name = "Other Income", Type = TransactionType.Income, IsDefault = true }

            };            // Configure Category entity

            modelBuilder.Entity<Category>(entity =>

            // Seed default expense categories            {

            var expenseCategories = new[]                entity.HasKey(e => e.Id);

            {                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);

                new Category { Id = 9, Name = "Food & Dining", Type = TransactionType.Expense, IsDefault = true },                entity.Property(e => e.Description).HasMaxLength(500);

                new Category { Id = 10, Name = "Transportation", Type = TransactionType.Expense, IsDefault = true },                entity.Property(e => e.Type).IsRequired();

                new Category { Id = 11, Name = "Housing", Type = TransactionType.Expense, IsDefault = true },                entity.Property(e => e.IsDefault).IsRequired().HasDefaultValue(false);

                new Category { Id = 12, Name = "Utilities", Type = TransactionType.Expense, IsDefault = true },                entity.Property(e => e.CreatedAt).IsRequired();

                new Category { Id = 13, Name = "Entertainment", Type = TransactionType.Expense, IsDefault = true },                

                new Category { Id = 14, Name = "Shopping", Type = TransactionType.Expense, IsDefault = true },                // Unique constraint on Name and Type

                new Category { Id = 15, Name = "Healthcare", Type = TransactionType.Expense, IsDefault = true },                entity.HasIndex(e => new { e.Name, e.Type }).IsUnique();

                new Category { Id = 16, Name = "Education", Type = TransactionType.Expense, IsDefault = true },            });

                new Category { Id = 17, Name = "Insurance", Type = TransactionType.Expense, IsDefault = true },            

                new Category { Id = 18, Name = "Subscriptions", Type = TransactionType.Expense, IsDefault = true },            // Seed some default categories

                new Category { Id = 19, Name = "Travel", Type = TransactionType.Expense, IsDefault = true },            SeedData(modelBuilder);

                new Category { Id = 20, Name = "Other Expense", Type = TransactionType.Expense, IsDefault = true }        }

            };        

        private void SeedData(ModelBuilder modelBuilder)

            modelBuilder.Entity<Category>().HasData(incomeCategories);        {

            modelBuilder.Entity<Category>().HasData(expenseCategories);            // Seed default income categories

        }            var incomeCategories = new[]

                    {

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)                new Category { Id = 1, Name = "Salary", Type = TransactionType.Income, IsDefault = true },

        {                new Category { Id = 2, Name = "Freelance", Type = TransactionType.Income, IsDefault = true },

            var entries = ChangeTracker                new Category { Id = 3, Name = "Investment", Type = TransactionType.Income, IsDefault = true },

                .Entries()                new Category { Id = 4, Name = "Gift", Type = TransactionType.Income, IsDefault = true },

                .Where(e => e.Entity is Transaction && (                new Category { Id = 5, Name = "Bonus", Type = TransactionType.Income, IsDefault = true },

                    e.State == EntityState.Added || e.State == EntityState.Modified));                new Category { Id = 6, Name = "Rental Income", Type = TransactionType.Income, IsDefault = true },

                new Category { Id = 7, Name = "Refund", Type = TransactionType.Income, IsDefault = true },

            foreach (var entityEntry in entries)                new Category { Id = 8, Name = "Other Income", Type = TransactionType.Income, IsDefault = true }

            {            };

                if (entityEntry.Entity is Transaction transaction)

                {            // Seed default expense categories

                    if (entityEntry.State == EntityState.Added)            var expenseCategories = new[]

                    {            {

                        transaction.CreatedAt = DateTime.UtcNow;                new Category { Id = 9, Name = "Food & Dining", Type = TransactionType.Expense, IsDefault = true },

                    }                new Category { Id = 10, Name = "Transportation", Type = TransactionType.Expense, IsDefault = true },

                    transaction.UpdatedAt = DateTime.UtcNow;                new Category { Id = 11, Name = "Housing", Type = TransactionType.Expense, IsDefault = true },

                }                new Category { Id = 12, Name = "Utilities", Type = TransactionType.Expense, IsDefault = true },

            }                new Category { Id = 13, Name = "Entertainment", Type = TransactionType.Expense, IsDefault = true },

                new Category { Id = 14, Name = "Shopping", Type = TransactionType.Expense, IsDefault = true },

            return await base.SaveChangesAsync(cancellationToken);                new Category { Id = 15, Name = "Healthcare", Type = TransactionType.Expense, IsDefault = true },

        }                new Category { Id = 16, Name = "Education", Type = TransactionType.Expense, IsDefault = true },

    }                new Category { Id = 17, Name = "Insurance", Type = TransactionType.Expense, IsDefault = true },

}                new Category { Id = 18, Name = "Subscriptions", Type = TransactionType.Expense, IsDefault = true },
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
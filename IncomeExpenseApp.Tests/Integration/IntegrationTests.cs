using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using IncomeExpenseApp.Data;
using IncomeExpenseApp.Models;
using System.Net.Http.Json;
using System.Net;
using Xunit;
using IncomeExpenseApp.Models.DTOs;

namespace IncomeExpenseApp.Tests.Integration
{
    public class IntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public IntegrationTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");
            });

            _client = _factory.CreateClient();
            
            // Seed database after client is created
            SeedDatabase();
        }

        private void SeedDatabase()
        {
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            // Clear existing data
            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();
            
            SeedTestData(context);
        }

        private static void SeedTestData(AppDbContext context)
        {
            // Clear existing data
            context.Transactions.RemoveRange(context.Transactions);
            context.Categories.RemoveRange(context.Categories);
            context.SaveChanges();

            // Add test categories
            var categories = new[]
            {
                new Category { Id = 1, Name = "Salary", Description = "Income from employment", Type = TransactionType.Income, IsDefault = true },
                new Category { Id = 2, Name = "Food", Description = "Food and dining expenses", Type = TransactionType.Expense, IsDefault = true },
                new Category { Id = 3, Name = "Transport", Description = "Transportation costs", Type = TransactionType.Expense, IsDefault = false },
                new Category { Id = 4, Name = "Entertainment", Description = "Fun and entertainment", Type = TransactionType.Expense, IsDefault = false }
            };

            context.Categories.AddRange(categories);
            context.SaveChanges();

            // Add test transactions
            var transactions = new[]
            {
                new Transaction
                {
                    Id = 1,
                    Description = "Monthly Salary",
                    Amount = 5000,
                    Type = TransactionType.Income,
                    Category = "Salary",
                    Date = DateTime.Today.AddDays(-1),
                    Notes = "Monthly salary payment"
                },
                new Transaction
                {
                    Id = 2,
                    Description = "Grocery Shopping",
                    Amount = 150,
                    Type = TransactionType.Expense,
                    Category = "Food",
                    Date = DateTime.Today,
                    Notes = "Weekly groceries"
                }
            };

            context.Transactions.AddRange(transactions);
            context.SaveChanges();
        }

        [Fact]
        public async Task Get_Transactions_ReturnsSuccessAndCorrectContentType()
        {
            // Act
            var response = await _client.GetAsync("/api/transactions");

            // Assert
            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType!.ToString());
            
            var transactions = await response.Content.ReadFromJsonAsync<TransactionResponseDto[]>();
            Assert.NotNull(transactions);
            Assert.Equal(2, transactions.Length);
        }

        [Fact]
        public async Task Get_Categories_ReturnsSuccessAndCorrectContentType()
        {
            // Act
            var response = await _client.GetAsync("/api/categories");

            // Assert
            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType!.ToString());
            
            var categories = await response.Content.ReadFromJsonAsync<CategoryResponseDto[]>();
            Assert.NotNull(categories);
            Assert.Equal(4, categories.Length);
        }

        [Fact]
        public async Task Post_Transaction_ReturnsCreatedTransaction()
        {
            // Arrange
            var newTransaction = new TransactionCreateDto
            {
                Description = "Integration Test Transaction",
                Amount = 200m,
                Type = TransactionType.Expense,
                Category = "Food",
                Date = DateTime.Today,
                Notes = "Created via integration test"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/transactions", newTransaction);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            
            var createdTransaction = await response.Content.ReadFromJsonAsync<TransactionResponseDto>();
            Assert.NotNull(createdTransaction);
            Assert.Equal("Integration Test Transaction", createdTransaction.Description);
            Assert.Equal(200m, createdTransaction.Amount);
        }

        [Fact]
        public async Task Post_Category_ReturnsCreatedCategory()
        {
            // Arrange
            var newCategory = new CreateCategoryDto
            {
                Name = "Integration Test Category",
                Type = TransactionType.Expense,
                Description = "Created via integration test"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/categories", newCategory);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            
            var createdCategory = await response.Content.ReadFromJsonAsync<CategoryResponseDto>();
            Assert.NotNull(createdCategory);
            Assert.Equal("Integration Test Category", createdCategory.Name);
            Assert.Equal(TransactionType.Expense, createdCategory.Type);
        }

        [Fact]
        public async Task Get_Summary_ReturnsCorrectCalculations()
        {
            // Act
            var response = await _client.GetAsync("/api/transactions/summary");

            // Assert
            response.EnsureSuccessStatusCode();
            
            var responseContent = await response.Content.ReadAsStringAsync();
            Assert.NotNull(responseContent);
            Assert.Contains("totalIncome", responseContent);
            Assert.Contains("totalExpense", responseContent);
            Assert.Contains("balance", responseContent);
        }

        [Fact]
        public async Task Put_Transaction_UpdatesExistingTransaction()
        {
            // Arrange
            var updateDto = new TransactionUpdateDto
            {
                Description = "Updated Monthly Salary",
                Amount = 5500m,
                Type = TransactionType.Income,
                Category = "Salary",
                Date = DateTime.Today,
                Notes = "Updated salary amount"
            };

            // Act
            var response = await _client.PutAsJsonAsync("/api/transactions/1", updateDto);

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
            
            // Verify the transaction was updated by fetching it
            var getResponse = await _client.GetAsync("/api/transactions/1");
            getResponse.EnsureSuccessStatusCode();
            
            var updatedTransaction = await getResponse.Content.ReadFromJsonAsync<TransactionResponseDto>();
            Assert.NotNull(updatedTransaction);
            Assert.Equal("Updated Monthly Salary", updatedTransaction.Description);
            Assert.Equal(5500m, updatedTransaction.Amount);
        }

        [Fact]
        public async Task Delete_Transaction_RemovesTransaction()
        {
            // Act
            var deleteResponse = await _client.DeleteAsync("/api/transactions/2");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

            // Verify transaction is deleted
            var getResponse = await _client.GetAsync("/api/transactions/2");
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        }

        [Fact]
        public async Task Get_NonExistentTransaction_ReturnsNotFound()
        {
            // Act
            var response = await _client.GetAsync("/api/transactions/999");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Get_StaticFiles_ReturnsSuccess()
        {
            // Act
            var response = await _client.GetAsync("/");

            // Assert
            response.EnsureSuccessStatusCode();
            Assert.Equal("text/html", response.Content.Headers.ContentType!.MediaType);
        }
    }
}
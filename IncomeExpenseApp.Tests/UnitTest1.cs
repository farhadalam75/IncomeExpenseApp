using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using IncomeExpenseApp.Controllers;
using IncomeExpenseApp.Models;
using IncomeExpenseApp.Models.DTOs;
using IncomeExpenseApp.Tests.Helpers;
using Xunit;
using Moq;

namespace IncomeExpenseApp.Tests.Controllers
{
    public class TransactionsControllerTests : IDisposable
    {
        private readonly TransactionsController _controller;
        private readonly Mock<ILogger<TransactionsController>> _mockLogger;
        private readonly Data.AppDbContext _context;

        public TransactionsControllerTests()
        {
            _mockLogger = new Mock<ILogger<TransactionsController>>();
            _context = TestDbContextFactory.CreateInMemoryContext();
            TestDbContextFactory.SeedTestData(_context);
            _controller = new TransactionsController(_context, _mockLogger.Object);
        }

        public void Dispose()
        {
            _context?.Dispose();
        }

        [Fact]
        public async Task GetTransactions_ReturnsAllTransactions()
        {
            // Act
            var result = await _controller.GetTransactions();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<TransactionResponseDto>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var transactions = Assert.IsAssignableFrom<IEnumerable<TransactionResponseDto>>(okResult.Value);
            Assert.Equal(2, transactions.Count());
        }

        [Fact]
        public async Task GetTransaction_WithValidId_ReturnsTransaction()
        {
            // Arrange
            var transactionId = 1;

            // Act
            var result = await _controller.GetTransaction(transactionId);

            // Assert
            var actionResult = Assert.IsType<ActionResult<TransactionResponseDto>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var transaction = Assert.IsType<TransactionResponseDto>(okResult.Value);
            Assert.Equal("Monthly Salary", transaction.Description);
            Assert.Equal(5000m, transaction.Amount);
        }

        [Fact]
        public async Task GetTransaction_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var invalidId = 999;

            // Act
            var result = await _controller.GetTransaction(invalidId);

            // Assert
            var actionResult = Assert.IsType<ActionResult<TransactionResponseDto>>(result);
            Assert.IsType<NotFoundObjectResult>(actionResult.Result);
        }

        [Fact]
        public async Task CreateTransaction_WithValidData_ReturnsCreatedTransaction()
        {
            // Arrange
            var createDto = new TransactionCreateDto
            {
                Description = "Test Transaction",
                Amount = 100m,
                Type = TransactionType.Income,
                Category = "Test Category",
                AccountId = 1, // Use the test account
                Date = DateTime.Today,
                Notes = "Test notes"
            };

            // Act
            var result = await _controller.CreateTransaction(createDto);

            // Assert
            var actionResult = Assert.IsType<ActionResult<TransactionResponseDto>>(result);
            var createdAtResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
            var transaction = Assert.IsType<TransactionResponseDto>(createdAtResult.Value);
            
            Assert.Equal("Test Transaction", transaction.Description);
            Assert.Equal(100m, transaction.Amount);
            Assert.Equal(TransactionType.Income, transaction.Type);
        }

        [Fact]
        public async Task GetSummary_ReturnsCorrectCalculations()
        {
            // Act
            var result = await _controller.GetSummary();

            // Assert
            var actionResult = Assert.IsType<ActionResult<object>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var summary = okResult.Value;
            
            // Use reflection to check the anonymous object properties
            var summaryType = summary!.GetType();
            var totalIncome = (decimal)summaryType.GetProperty("TotalIncome")!.GetValue(summary)!;
            var totalExpense = (decimal)summaryType.GetProperty("TotalExpense")!.GetValue(summary)!;
            var balance = (decimal)summaryType.GetProperty("Balance")!.GetValue(summary)!;
            
            Assert.Equal(5000m, totalIncome);
            Assert.Equal(150m, totalExpense);
            Assert.Equal(4850m, balance);
        }

        [Fact]
        public async Task UpdateTransaction_WithValidData_ReturnsUpdatedTransaction()
        {
            // Arrange
            var transactionId = 1;
            var updateDto = new TransactionUpdateDto
            {
                Description = "Updated Salary",
                Amount = 5500m,
                Type = TransactionType.Income,
                Category = "Salary",
                AccountId = 1, // Use the test account
                Date = DateTime.Today,
                Notes = "Updated notes"
            };

            // Act
            var result = await _controller.UpdateTransaction(transactionId, updateDto);

            // Assert
            var noContentResult = Assert.IsType<NoContentResult>(result);
            Assert.Equal(204, noContentResult.StatusCode);
        }

        [Fact]
        public async Task DeleteTransaction_WithValidId_ReturnsNoContent()
        {
            // Arrange
            var transactionId = 2;

            // Act
            var result = await _controller.DeleteTransaction(transactionId);

            // Assert
            Assert.IsType<NoContentResult>(result);

            // Verify transaction is deleted
            var getResult = await _controller.GetTransaction(transactionId);
            var actionResult = Assert.IsType<ActionResult<TransactionResponseDto>>(getResult);
            Assert.IsType<NotFoundObjectResult>(actionResult.Result);
        }

        [Theory]
        [InlineData(TransactionType.Income)]
        [InlineData(TransactionType.Expense)]
        public async Task GetTransactions_FilterByType_ReturnsFilteredResults(TransactionType type)
        {
            // Act
            var result = await _controller.GetTransactions(type: type);

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<TransactionResponseDto>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var transactions = Assert.IsAssignableFrom<IEnumerable<TransactionResponseDto>>(okResult.Value);
            
            Assert.All(transactions, t => Assert.Equal(type, t.Type));
        }
    }
}
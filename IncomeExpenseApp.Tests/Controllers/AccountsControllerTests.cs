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
    public class AccountsControllerTests : IDisposable
    {
        private readonly AccountsController _controller;
        private readonly Data.AppDbContext _context;

        public AccountsControllerTests()
        {
            _context = TestDbContextFactory.CreateInMemoryContext();
            TestDbContextFactory.SeedTestData(_context);
            _controller = new AccountsController(_context);
        }

        public void Dispose()
        {
            _context?.Dispose();
        }

        [Fact]
        public async Task GetAccounts_ReturnsAllAccounts()
        {
            // Act
            var result = await _controller.GetAccounts();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<AccountResponseDto>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var accounts = Assert.IsAssignableFrom<IEnumerable<AccountResponseDto>>(okResult.Value);
            Assert.Equal(2, accounts.Count()); // Should have 2 test accounts
        }

        [Fact]
        public async Task GetAccount_WithValidId_ReturnsAccount()
        {
            // Arrange
            var accountId = 1;

            // Act
            var result = await _controller.GetAccount(accountId);

            // Assert
            var actionResult = Assert.IsType<ActionResult<AccountResponseDto>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var account = Assert.IsType<AccountResponseDto>(okResult.Value);
            
            Assert.Equal(accountId, account.Id);
            Assert.Equal("Test Cash Account", account.Name);
            Assert.Equal(AccountType.Cash, account.Type);
        }

        [Fact]
        public async Task CreateAccount_WithValidData_ReturnsCreatedAccount()
        {
            // Arrange
            var createDto = new AccountCreateDto
            {
                Name = "Test Savings Account",
                Description = "A test savings account",
                Type = AccountType.Savings,
                Icon = "🏛️",
                InitialBalance = 1000m
            };

            // Act
            var result = await _controller.CreateAccount(createDto);

            // Assert
            var actionResult = Assert.IsType<ActionResult<AccountResponseDto>>(result);
            var createdAtResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
            var account = Assert.IsType<AccountResponseDto>(createdAtResult.Value);
            
            Assert.Equal("Test Savings Account", account.Name);
            Assert.Equal(AccountType.Savings, account.Type);
            Assert.Equal(1000m, account.Balance);
        }

        [Fact]
        public async Task CreateAccount_WithDuplicateName_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new AccountCreateDto
            {
                Name = "Test Cash Account", // This name already exists
                Type = AccountType.Bank,
                Icon = "🏦"
            };

            // Act
            var result = await _controller.CreateAccount(createDto);

            // Assert
            var actionResult = Assert.IsType<ActionResult<AccountResponseDto>>(result);
            Assert.IsType<BadRequestObjectResult>(actionResult.Result);
        }

        [Fact]
        public async Task UpdateAccount_WithValidData_ReturnsNoContent()
        {
            // Arrange
            var accountId = 1;
            var updateDto = new AccountUpdateDto
            {
                Name = "Updated Cash Account",
                Description = "Updated description",
                Type = AccountType.Cash,
                Icon = "💵"
            };

            // Act
            var result = await _controller.UpdateAccount(accountId, updateDto);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task AdjustBalance_WithIncomeTransaction_IncreasesBalance()
        {
            // Arrange
            var accountId = 1;
            var adjustmentDto = new AccountBalanceUpdateDto
            {
                Amount = 500m,
                Description = "Test income",
                Type = TransactionType.Income
            };

            // Get initial balance
            var initialAccount = await _controller.GetAccount(accountId);
            var initialResult = Assert.IsType<OkObjectResult>(((ActionResult<AccountResponseDto>)initialAccount).Result);
            var initialAccountDto = Assert.IsType<AccountResponseDto>(initialResult.Value);
            var initialBalance = initialAccountDto.Balance;

            // Act
            var result = await _controller.AdjustBalance(accountId, adjustmentDto);

            // Assert
            var actionResult = Assert.IsType<ActionResult<AccountResponseDto>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var updatedAccount = Assert.IsType<AccountResponseDto>(okResult.Value);
            
            Assert.Equal(initialBalance + 500m, updatedAccount.Balance);
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IncomeExpenseApp.Data;
using IncomeExpenseApp.Models;
using IncomeExpenseApp.Models.DTOs;

namespace IncomeExpenseApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<CategoriesController> _logger;

        public CategoriesController(AppDbContext context, ILogger<CategoriesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryResponseDto>>> GetCategories(
            [FromQuery] TransactionType? type = null)
        {
            try
            {
                var query = _context.Categories.AsQueryable();
                
                if (type.HasValue)
                {
                    query = query.Where(c => c.Type == type.Value);
                }

                var categories = await query
                    .OrderBy(c => c.Type)
                    .ThenBy(c => c.Name)
                    .ToListAsync();

                // Calculate transaction counts and totals for each category
                var categoryDtos = new List<CategoryResponseDto>();
                
                foreach (var category in categories)
                {
                    var transactions = await _context.Transactions
                        .Where(t => t.Category == category.Name)
                        .ToListAsync();
                        
                    categoryDtos.Add(new CategoryResponseDto
                    {
                        Id = category.Id,
                        Name = category.Name,
                        Type = category.Type,
                        Description = category.Description,
                        IsDefault = category.IsDefault,
                        TransactionCount = transactions.Count,
                        TotalAmount = transactions.Sum(t => t.Amount)
                    });
                }

                return Ok(categoryDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories");
                return StatusCode(500, "An error occurred while retrieving categories");
            }
        }

        // GET: api/categories/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryResponseDto>> GetCategory(int id)
        {
            try
            {
                var category = await _context.Categories.FindAsync(id);
                
                if (category == null)
                {
                    return NotFound("Category not found");
                }

                var transactions = await _context.Transactions
                    .Where(t => t.Category == category.Name)
                    .ToListAsync();

                var categoryDto = new CategoryResponseDto
                {
                    Id = category.Id,
                    Name = category.Name,
                    Type = category.Type,
                    Description = category.Description,
                    IsDefault = category.IsDefault,
                    TransactionCount = transactions.Count,
                    TotalAmount = transactions.Sum(t => t.Amount)
                };

                return Ok(categoryDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving category {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the category");
            }
        }

        // POST: api/categories
        [HttpPost]
        public async Task<ActionResult<CategoryResponseDto>> CreateCategory(CreateCategoryDto createDto)
        {
            try
            {
                // Check if category with same name and type already exists
                var existingCategory = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Name == createDto.Name && c.Type == createDto.Type);
                    
                if (existingCategory != null)
                {
                    return BadRequest("A category with this name and type already exists");
                }

                var category = new Category
                {
                    Name = createDto.Name,
                    Type = createDto.Type,
                    Description = createDto.Description,
                    IsDefault = false,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Categories.Add(category);
                await _context.SaveChangesAsync();

                var categoryDto = new CategoryResponseDto
                {
                    Id = category.Id,
                    Name = category.Name,
                    Type = category.Type,
                    Description = category.Description,
                    IsDefault = category.IsDefault,
                    TransactionCount = 0,
                    TotalAmount = 0
                };

                return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, categoryDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category");
                return StatusCode(500, "An error occurred while creating the category");
            }
        }

        // PUT: api/categories/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<CategoryResponseDto>> UpdateCategory(int id, UpdateCategoryDto updateDto)
        {
            try
            {
                var category = await _context.Categories.FindAsync(id);
                
                if (category == null)
                {
                    return NotFound("Category not found");
                }

                // Don't allow updating default categories
                if (category.IsDefault)
                {
                    return BadRequest("Cannot update default categories");
                }

                // Check if new name conflicts with existing category
                var existingCategory = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Name == updateDto.Name && c.Type == category.Type && c.Id != id);
                    
                if (existingCategory != null)
                {
                    return BadRequest("A category with this name already exists for this transaction type");
                }

                category.Name = updateDto.Name;
                category.Description = updateDto.Description;

                await _context.SaveChangesAsync();

                var transactions = await _context.Transactions
                    .Where(t => t.Category == category.Name)
                    .ToListAsync();

                var categoryDto = new CategoryResponseDto
                {
                    Id = category.Id,
                    Name = category.Name,
                    Type = category.Type,
                    Description = category.Description,
                    IsDefault = category.IsDefault,
                    TransactionCount = transactions.Count,
                    TotalAmount = transactions.Sum(t => t.Amount)
                };

                return Ok(categoryDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating category {Id}", id);
                return StatusCode(500, "An error occurred while updating the category");
            }
        }

        // DELETE: api/categories/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                var category = await _context.Categories.FindAsync(id);
                
                if (category == null)
                {
                    return NotFound("Category not found");
                }

                // Don't allow deleting default categories
                if (category.IsDefault)
                {
                    return BadRequest("Cannot delete default categories");
                }

                // Check if category has transactions
                var hasTransactions = await _context.Transactions
                    .AnyAsync(t => t.Category == category.Name);
                    
                if (hasTransactions)
                {
                    return BadRequest("Cannot delete category that has transactions. Please delete or reassign transactions first.");
                }

                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting category {Id}", id);
                return StatusCode(500, "An error occurred while deleting the category");
            }
        }
    }
}
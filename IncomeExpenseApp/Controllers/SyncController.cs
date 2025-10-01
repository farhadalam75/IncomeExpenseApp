using Microsoft.AspNetCore.Mvc;
using IncomeExpenseApp.Services;

namespace IncomeExpenseApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SyncController : ControllerBase
    {
        private readonly IGoogleDriveSyncService _syncService;
        private readonly ILogger<SyncController> _logger;

        public SyncController(IGoogleDriveSyncService syncService, ILogger<SyncController> logger)
        {
            _syncService = syncService;
            _logger = logger;
        }

        // GET: api/sync/status
        [HttpGet("status")]
        public async Task<ActionResult> GetSyncStatus()
        {
            try
            {
                var isAuthenticated = await _syncService.IsAuthenticatedAsync();
                return Ok(new { 
                    isAuthenticated,
                    message = isAuthenticated ? "Google Drive sync is enabled" : "Google Drive sync not configured"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking sync status");
                return StatusCode(500, new { message = "Error checking sync status" });
            }
        }

        // GET: api/sync/auth-url
        [HttpGet("auth-url")]
        public async Task<ActionResult> GetAuthUrl()
        {
            try
            {
                var authUrl = await _syncService.GetAuthUrlAsync();
                return Ok(new { authUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting auth URL");
                return StatusCode(500, new { message = "Error getting authorization URL" });
            }
        }

        // POST: api/sync/complete-auth
        [HttpPost("complete-auth")]
        public async Task<ActionResult> CompleteAuth([FromBody] AuthCodeRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Code))
                {
                    return BadRequest(new { message = "Authorization code is required" });
                }

                var success = await _syncService.CompleteAuthAsync(request.Code);
                if (success)
                {
                    return Ok(new { message = "Authentication completed successfully" });
                }
                else
                {
                    return BadRequest(new { message = "Failed to complete authentication" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing authentication");
                return StatusCode(500, new { message = "Error completing authentication" });
            }
        }

        // POST: api/sync/backup
        [HttpPost("backup")]
        public async Task<ActionResult> BackupData()
        {
            try
            {
                _logger.LogInformation("Starting manual backup...");
                
                var success = await _syncService.BackupDataAsync();
                if (success)
                {
                    return Ok(new { 
                        message = "Data backed up successfully to Google Drive",
                        timestamp = DateTime.UtcNow
                    });
                }
                else
                {
                    return BadRequest(new { message = "Failed to backup data" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error backing up data");
                return StatusCode(500, new { message = "Error backing up data" });
            }
        }

        // POST: api/sync/restore
        [HttpPost("restore")]
        public async Task<ActionResult> RestoreData()
        {
            try
            {
                _logger.LogInformation("Starting manual restore...");
                
                var success = await _syncService.RestoreDataAsync();
                if (success)
                {
                    return Ok(new { 
                        message = "Data restored successfully from Google Drive",
                        timestamp = DateTime.UtcNow
                    });
                }
                else
                {
                    return BadRequest(new { message = "Failed to restore data" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restoring data");
                return StatusCode(500, new { message = "Error restoring data" });
            }
        }
    }

    public class AuthCodeRequest
    {
        public string Code { get; set; } = string.Empty;
    }
}
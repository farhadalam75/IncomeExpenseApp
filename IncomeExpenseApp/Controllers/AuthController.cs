using Microsoft.AspNetCore.Mvc;
using IncomeExpenseApp.Services;

namespace IncomeExpenseApp.Controllers
{
    [Route("auth/google")]
    public class AuthController : Controller
    {
        private readonly IGoogleDriveSyncService _syncService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IGoogleDriveSyncService syncService, ILogger<AuthController> logger)
        {
            _syncService = syncService;
            _logger = logger;
        }

        [HttpGet("callback")]
        public async Task<IActionResult> GoogleCallback(string code, string state, string error)
        {
            if (!string.IsNullOrEmpty(error))
            {
                _logger.LogWarning("Google auth error: {Error}", error);
                return Content($@"
                    <html>
                    <body>
                        <h2>❌ Authentication Failed</h2>
                        <p>Error: {error}</p>
                        <p>You can close this window and try again.</p>
                        <script>setTimeout(() => window.close(), 3000);</script>
                    </body>
                    </html>", "text/html");
            }

            if (string.IsNullOrEmpty(code))
            {
                return BadRequest("Authorization code is required");
            }

            try
            {
                var success = await _syncService.CompleteAuthAsync(code);
                
                if (success)
                {
                    return Content(@"
                        <html>
                        <body style='font-family: Arial, sans-serif; text-align: center; padding: 50px;'>
                            <h2>✅ Authentication Successful!</h2>
                            <p>Google Drive sync is now enabled.</p>
                            <p>You can close this window and return to the app.</p>
                            <script>
                                setTimeout(() => {
                                    window.close();
                                    if (window.opener) {
                                        window.opener.location.reload();
                                    }
                                }, 2000);
                            </script>
                        </body>
                        </html>", "text/html");
                }
                else
                {
                    return Content(@"
                        <html>
                        <body style='font-family: Arial, sans-serif; text-align: center; padding: 50px;'>
                            <h2>❌ Authentication Failed</h2>
                            <p>Failed to complete authentication. Please try again.</p>
                            <script>setTimeout(() => window.close(), 3000);</script>
                        </body>
                        </html>", "text/html");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing Google authentication");
                return Content($@"
                    <html>
                    <body style='font-family: Arial, sans-serif; text-align: center; padding: 50px;'>
                        <h2>❌ Authentication Error</h2>
                        <p>An error occurred during authentication.</p>
                        <p>You can close this window and try again.</p>
                        <script>setTimeout(() => window.close(), 3000);</script>
                    </body>
                    </html>", "text/html");
            }
        }
    }
}
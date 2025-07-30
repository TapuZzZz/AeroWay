// Location: Middleware/TempDataCleanupMiddleware.cs

using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace AeroWayClient.Middleware
{
    public class TempDataCleanupMiddleware
    {
        private readonly RequestDelegate _next;

        public TempDataCleanupMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path.Value?.ToLower() ?? "";
            
            if (path == "/" || path == "/home" || path == "/home/index" || 
                (path == "/account/login" && context.Request.Method == "GET"))
            {
                var referer = context.Request.Headers["Referer"].ToString().ToLower();
                
                var shouldKeepTempData = false;
                
                if (referer.Contains("/flight/"))
                {
                    shouldKeepTempData = true;
                }
                
                if (path == "/account/login" && context.Request.Method == "GET")
                {
                    var tempDataFactory = context.RequestServices.GetService<Microsoft.AspNetCore.Mvc.ViewFeatures.ITempDataDictionaryFactory>();
                    if (tempDataFactory != null)
                    {
                        var tempData = tempDataFactory.GetTempData(context);
                        
                        if (tempData.ContainsKey("SelectedOutboundFlightId") || 
                            (tempData.ContainsKey("ReturnUrl") && 
                             tempData.ContainsKey("SearchParams") && 
                             tempData.ContainsKey("FlightResults")))
                        {
                            shouldKeepTempData = true;
                        }
                    }
                }
                
                if (!shouldKeepTempData)
                {
                    if (context.Features.Get<Microsoft.AspNetCore.Mvc.ViewFeatures.ITempDataDictionaryFactory>() != null)
                    {
                        var tempDataFactory = context.RequestServices.GetService<Microsoft.AspNetCore.Mvc.ViewFeatures.ITempDataDictionaryFactory>();
                        if (tempDataFactory != null)
                        {
                            var tempData = tempDataFactory.GetTempData(context);
                            tempData.Clear();
                        }
                    }
                }
            }

            await _next(context);
        }
    }

    public static class TempDataCleanupMiddlewareExtensions
    {
        public static IApplicationBuilder UseTempDataCleanup(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<TempDataCleanupMiddleware>();
        }
    }
}
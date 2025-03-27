using System;
using System.Text;
using System.Collections.Generic;
using MySql.Data.MySqlClient;
using System.IO;

namespace AeroWayServer.Pages
{
    public static class DatabasePage
    {
        public static string GenerateDatabaseHtml(string connectionString)
        {
            StringBuilder html = new StringBuilder();
            List<Dictionary<string, object>> tables = new List<Dictionary<string, object>>();
    
            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
            
                    // Get all tables from the database
                    using (var command = new MySqlCommand("SHOW TABLES", connection))
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            string tableName = reader.GetString(0);
                            tables.Add(new Dictionary<string, object> { { "name", tableName } });
                        }
                    }

                    // Get data for each table
                    foreach (var table in tables)
                    {
                        if (!table.TryGetValue("name", out object? value) || value is not string tableName)
                        {
                            continue;
                        }

                        if (string.IsNullOrEmpty(tableName))
                        {
                            continue;
                        }

                        string query = $"SELECT * FROM {tableName} ORDER BY ID LIMIT 100";
                        using (var command = new MySqlCommand(query, connection))
                        using (var reader = command.ExecuteReader())
                        {
                            var columns = new List<string>();
                            for (int i = 0; i < reader.FieldCount; i++)
                            {
                                columns.Add(reader.GetName(i));
                            }
                            table["columns"] = columns;

                            var rows = new List<Dictionary<string, object>>();
                            while (reader.Read())
                            {
                                var row = new Dictionary<string, object>();
                                for (int i = 0; i < reader.FieldCount; i++)
                                {
                                    row[reader.GetName(i)] = reader.IsDBNull(i) ? "NULL" : reader.GetValue(i);
                                }
                                rows.Add(row);
                            }
                            table["rows"] = rows;
                        }
                    }
                }
            }
            catch (MySqlException ex)
            {
                Log($"❌ MySQL Database Error: {ex.Message}");
                Log($"Error Code: {ex.Number}");
                Log($"SQL State: {ex.SqlState}");
            
                // Create an error table to display in the UI
                var errorTable = new Dictionary<string, object>
                {
                    { "name", "Error" },
                    { "columns", new List<string> { "Error Message" } },
                    { "rows", new List<Dictionary<string, object>> 
                        { 
                            new Dictionary<string, object> 
                            { 
                                { "Error Message", $"Database Error: {ex.Message}" } 
                            } 
                        } 
                    }
                };
                tables.Add(errorTable);
            }
            catch (Exception ex)
            {
                Log($"❌ Unexpected Error in Database Generation: {ex.Message}");
                Log($"Stack Trace: {ex.StackTrace}");
            
                // Create an error table to display in the UI
                var errorTable = new Dictionary<string, object>
                {
                    { "name", "Error" },
                    { "columns", new List<string> { "Error Message" } },
                    { "rows", new List<Dictionary<string, object>> 
                        { 
                            new Dictionary<string, object> 
                            { 
                                { "Error Message", $"Unexpected Error: {ex.Message}" } 
                            } 
                        } 
                    }
                };
                tables.Add(errorTable);
            }

            // Read CSS and JS contents directly
            string cssContent = File.Exists("wwwroot/css/Database.css") 
                ? File.ReadAllText("wwwroot/css/Database.css") 
                : "/* CSS file not found */";
            
            string jsContent = File.Exists("wwwroot/js/Database.js") 
                ? File.ReadAllText("wwwroot/js/Database.js") 
                : "// JavaScript file not found";

            html.Append($@"
            <!DOCTYPE html>
            <html lang=""en"">
            <head>
                <title>AeroWay Database</title>
                <meta charset=""UTF-8"">
                <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
                <link href=""https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap"" rel=""stylesheet"">
                <style>{cssContent}</style>
            </head>
            <body>
                <div class=""dashboard"">
                    <aside class=""sidebar"">
                        <div class=""logo"">
                            <span class=""logo-text"">AeroWay</span>
                            <span class=""logo-subtext"">Database</span>
                        </div>
                        
                        <div class=""divider""></div>
                        
                        <div class=""sidebar-buttons"">
                            <div id=""refreshStatus"" class=""sidebar-button status-active"" onclick=""toggleRefresh()"">
                                <span class=""status-icon"">🔄</span>
                                <span class=""status-text"">Auto Refresh</span>
                            </div>

                            <button class=""sidebar-button"" onclick=""toggleTheme()"">
                                <span id=""themeIcon"">🌞</span>
                                <span id=""themeText"">Switch Theme</span>
                            </button>

                            <button class=""sidebar-button"" onclick=""window.location.href='/dashboard'"">
                                <span>📊</span>
                                <span>Dashboard</span>
                            </button>

                            <button class=""sidebar-button"" onclick=""window.location.href='/flightmanager'"">
                                <span>✈️</span>
                                <span>Flight Manager</span>
                            </button>
                            
                            <div class=""sidebar-button"">
                                <span class=""status-icon"">🕒</span>
                                <span id=""lastUpdateTime"">" + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + @"</span>
                            </div>

                            <form action=""/logout"" method=""GET"">
                                <button class=""sidebar-button danger"">
                                    <span>🚪</span>
                                    <span>Logout</span>
                                </button>
                            </form>
                        </div>
                    </aside>

                    <main class=""main-content"">");

            foreach (var table in tables)
            {
                html.Append($@"
                <div class=""table-container"" id=""container-{table["name"]}"">
                    <div class=""table-header"">
                        <div class=""table-header-top"">
                            <h2 class=""table-title"">
                                <span>📋</span>
                                {table["name"]}
                            </h2>
                            <div class=""table-controls"">
                                <button class=""minimize-button"" onclick=""toggleTable('{table["name"]}')"">
                                    <span id=""minimize-icon-{table["name"]}"">🔽</span>
                                </button>
                                <div class=""search-box"">
                                    <span>🔍</span>
                                    <input type=""text"" 
                                        placeholder=""Search in {table["name"]}...""
                                        onkeyup=""searchTable(this, '{table["name"]}')"">
                                </div>
                                <button class=""table-button"" onclick=""exportTable('{table["name"]}')"">
                                    <span>📤</span>
                                    Export
                                </button>
                                <button class=""table-button"" onclick=""refreshTable('{table["name"]}')"">
                                    <span>🔄</span>
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class=""table-content"" id=""content-{table["name"]}"">
                        <div style=""overflow-x: auto;"">
                            <table class=""data-table"" data-table=""{table["name"]}"">
                                <thead>
                                    <tr>");

                var columns = (List<string>)table["columns"];
                foreach (var column in columns)
                {
                    html.Append($@"
                        <th>
                            <button class=""sort-button"" onclick=""sortTable(this.closest('table'), '{column}')"">
                                <span>{column}</span>
                                <span>⇅</span>
                            </button>
                        </th>");
                }

                html.Append(@"
                                    </tr>
                                </thead>
                                <tbody>");

                var rows = (List<Dictionary<string, object>>)table["rows"];
                foreach (var row in rows)
                {
                    html.Append("<tr>");
                    foreach (var column in columns)
                    {
                        string cellValue = row[column]?.ToString() ?? "NULL";
                        html.Append($"<td data-original-value=\"{cellValue}\">{cellValue}</td>");
                    }
                    html.Append("</tr>");
                }

                html.Append(@"
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>");
            }

            html.Append($@"
                    </main>
                </div>

                <script>{jsContent}</script>
                <!-- External libraries -->
                <script src=""https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js""></script>
                <script src=""https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js""></script>
                <script src=""https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js""></script>
            </body>
            </html>");

            return html.ToString();
        }

        private static void Log(string message)
        {
            string logMessage = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {message}";
            Console.WriteLine(logMessage);
            
            try 
            {
                File.AppendAllText("server_log.txt", logMessage + Environment.NewLine);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error writing to log file: {ex.Message}");
            }
        }
    }
}
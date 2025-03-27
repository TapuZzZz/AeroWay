namespace AeroWayServer
{
    public class SessionInfo
    {
        public string SessionId { get; set; }
        public string ClientIP { get; set; }
        public DateTime StartTime { get; set; }
        public int MessageCount { get; set; }

        public SessionInfo(string sessionId, string clientIP)
        {
            SessionId = sessionId;
            ClientIP = clientIP;
            StartTime = DateTime.Now;
            MessageCount = 0;
        }

        public string GetDuration()
        {
            var duration = DateTime.Now - StartTime;
            return $"{(int)duration.TotalMinutes}m {duration.Seconds}s";
        }
    }
}

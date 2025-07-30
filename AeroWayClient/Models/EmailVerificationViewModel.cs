namespace AeroWayClient.Models
{
    public class EmailVerificationViewModel
    {
        public string Token { get; set; } = "";
        public VerificationStatus Status { get; set; }
        public string Message { get; set; } = "";
    }

    public enum VerificationStatus
    {
        Pending,
        Success,
        Failed,
        Expired,
        AlreadyVerified
    }
}
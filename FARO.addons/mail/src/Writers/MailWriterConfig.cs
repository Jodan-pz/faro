namespace FARO.Addons.Mail.Writers {

    class MailWriterConfig {
        public string From { get; set; } = "noreply@faro.com";
        public SmtpServerConfig Server { get; set; }
    }
}
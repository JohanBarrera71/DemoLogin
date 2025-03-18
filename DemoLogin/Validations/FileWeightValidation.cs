using System.ComponentModel.DataAnnotations;

namespace PeliculasApi.Validations
{
    public class FileWeightValidation(int MaxWeightInMegaBytes) : ValidationAttribute
    {
        private readonly int maxWeightInMegaBytes = MaxWeightInMegaBytes;

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            if (value == null) return ValidationResult.Success;

            IFormFile formFile = value as IFormFile;
            if (formFile == null) return ValidationResult.Success;

            if (formFile.Length > maxWeightInMegaBytes * 1024 * 1024)
                return new ValidationResult($"File weight should not be more than {maxWeightInMegaBytes}mb");

            return ValidationResult.Success;
        }
    }
}
